# frozen_string_literal: true

require "minitest/autorun"
require "yaml"

class Alphafold3InferenceLoopsTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @architecture = YAML.load_file(File.join(ROOT, "architectures/alphafold3-pairformer.yaml"), aliases: true)
    @view = YAML.load_file(File.join(ROOT, "views/alphafold3-pairformer-semantic-zoom.view.yaml"), aliases: true)
    @pseudocode = YAML.load_file(File.join(ROOT, "pseudocode/alphafold3-pairformer.yaml"), aliases: true)
    @relations = @architecture.fetch("relations").to_h { |relation| [relation.fetch("id"), relation] }
    @boards = @view.fetch("boards").to_h { |board| [board.fetch("id"), board] }
  end

  def test_trunk_pass_restarts_from_fixed_anchors_and_carries_both_outputs
    loop = @architecture.dig("execution", "loops").find { |item| item.fetch("id") == "trunk_recycling" }
    assert_equal 4, loop.fetch("repeats")
    assert_includes loop.fetch("cached"), "value_sites.single_init"
    assert_includes loop.fetch("cached"), "value_sites.z_init"
    assert_equal %w[modules.template_module modules.msa_module modules.pairformer_stack],
      loop.fetch("reruns").last(3)

    assert_relation "single_anchor_initializes_recycle_pass", "value_sites.single_init", "value_sites.single_state_input"
    assert_relation "pair_anchor_initializes_recycle_pass", "value_sites.z_init", "value_sites.pair_recycle_seed"
    assert_relation "trunk_single_output_reenters_recycle", "value_sites.single_state_output", "value_sites.recycled_single_state"
    assert_relation "trunk_pair_output_reenters_recycle", "value_sites.pair_state_output", "value_sites.recycled_pair_state"

    trunk = @architecture.fetch("modules").find { |item| item.fetch("id") == "trunk_model" }
    assert_equal "architecture", trunk.fetch("parent_ref")
    assert_equal "trunk_model_detail", @boards.fetch("pairformer_overview").fetch("nodes")
      .find { |node| node.fetch("id") == "trunk_model" }.fetch("board_ref")
    %w[template_module msa_module pairformer_stack single_recycle_projection pair_recycle_projection].each do |module_id|
      child = @architecture.fetch("modules").find { |item| item.fetch("id") == module_id }
      assert_equal "modules.trunk_model", child.fetch("parent_ref")
    end
    %w[single_init z_init recycled_single_state recycled_pair_state single_state_output pair_state_output].each do |site_id|
      site = @architecture.fetch("value_sites").find { |item| item.fetch("id") == site_id }
      assert_equal "modules.trunk_model", site.fetch("scope_ref")
    end

    region = @boards.fetch("trunk_model_detail").fetch("regions").find { |item| item.fetch("id") == "one_trunk_recycle" }
    assert_equal "execution.loops.trunk_recycling", region.fetch("execution_ref")
    assert_includes region.fetch("iteration_relation_refs"), "relations.trunk_single_output_reenters_recycle"
    assert_includes region.fetch("iteration_relation_refs"), "relations.trunk_pair_output_reenters_recycle"
  end

  def test_sampler_keeps_updated_state_distinct_from_denoiser_estimate
    loop = @architecture.dig("execution", "loops").find { |item| item.fetch("id") == "sample_diffusion" }
    assert_equal 200, loop.fetch("repeats")
    assert_includes loop.fetch("reruns"), "modules.sampler_pose_augmentation"
    assert_includes loop.fetch("reruns"), "modules.sampler_noise_injection"
    assert_includes loop.fetch("reruns"), "modules.sampler_gradient"
    assert_relation "sampler_updated_positions_reenter_next_step", "value_sites.sampler_updated_positions", "value_sites.sampler_current_positions"
    assert_relation "sampler_next_level_becomes_previous_level", "value_sites.sampler_next_level", "value_sites.sampler_previous_level"
    refute @relations.values.any? { |relation|
      relation.fetch("from") == "value_sites.denoised_atom_positions" &&
        relation.fetch("to") == "value_sites.sampler_current_positions"
    }

    schedule = @architecture.fetch("modules").find { |item| item.fetch("id") == "sampler_schedule" }
    assert_includes schedule.fetch("role"), "actual noise levels 2560 down to 0.0064"
    region = @boards.fetch("sample_diffusion_detail").fetch("regions").first
    assert_equal "execution.loops.sample_diffusion", region.fetch("execution_ref")
    assert_equal "sampler_update_detail", @boards.fetch("sample_diffusion_detail").fetch("nodes")
      .find { |node| node.fetch("id") == "sampler_update" }.fetch("board_ref")

    scopes = @pseudocode.fetch("scopes").to_h { |scope| [scope.fetch("id"), scope] }
    assert_equal "execution.loops.sample_diffusion", scopes.fetch("sampler").fetch("execution_ref")
    assert_equal "modules.sampler_update", scopes.fetch("sampler_update_math").fetch("subject_ref")
    update_line = @pseudocode.fetch("lines").find { |line| line.fetch("id") == "apply_sampler_update" }
    assert_includes update_line.fetch("text"), "1.5 * (t_next - t_hat) * direction"
  end

  private

  def assert_relation(id, from, to)
    relation = @relations.fetch(id)
    assert_equal from, relation.fetch("from")
    assert_equal to, relation.fetch("to")
  end
end
