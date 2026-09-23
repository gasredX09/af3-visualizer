# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/architecture_projection"

class Alphafold3ConfidenceFlowTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @architecture = YAML.load_file(File.join(ROOT, "architectures/alphafold3-pairformer.yaml"), aliases: true)
    view = YAML.load_file(File.join(ROOT, "views/alphafold3-pairformer-semantic-zoom.view.yaml"), aliases: true)
    root_board = view.fetch("boards").find { |board| board.fetch("id") == "pairformer_overview" }
    @root_edges = ArchitectureProjection::Projector.new(@architecture).project(root_board).fetch("edges")
  end

  def test_only_completed_sample_crosses_into_confidence_head
    sites = @architecture.fetch("value_sites").to_h { |site| [site.fetch("id"), site] }
    assert_nil sites.fetch("denoised_atom_positions")["boundary"]
    assert_equal "output", sites.fetch("final_sampled_atom_positions").fetch("boundary")

    assert_edge "sample_diffusion", "final_sampled_atom_positions"
    assert_edge "final_sampled_atom_positions", "confidence_head"
    refute @root_edges.any? { |edge| edge.fetch("from") == "denoised_atom_positions" },
      "a one-step denoiser estimate must not appear as a finished root output"

    confidence_inputs = @architecture.fetch("relations").select do |relation|
      relation.fetch("to").start_with?("modules.confidence", "value_sites.confidence")
    end
    refute confidence_inputs.any? { |relation| relation.fetch("from") == "value_sites.denoised_atom_positions" },
      "the confidence head must consume the completed sample, not one denoising estimate"
  end

  def test_four_predictions_are_projected_from_one_confidence_head
    %w[
      predicted_lddt
      predicted_aligned_error
      predicted_distance_error
      predicted_experimentally_resolved
    ].each do |output|
      assert_edge "confidence_head", output
    end

    assert_edge "single_state_output", "confidence_head"
    assert_edge "pair_state_output", "confidence_head"
    assert_edge "s_inputs", "confidence_head"
  end

  private

  def assert_edge(from, to)
    assert @root_edges.any? { |edge| edge.fetch("from") == from && edge.fetch("to") == to },
      "expected projected #{from} to #{to} flow on the root board"
  end
end
