# frozen_string_literal: true

require "minitest/autorun"
require "yaml"

class Alphafold3MsaExampleTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_outer_product_mean_is_described_as_an_uncentered_product
    architecture = YAML.load_file(File.join(ROOT, "architectures/alphafold3-pairformer.yaml"), aliases: true)
    view = YAML.load_file(File.join(ROOT, "views/alphafold3-pairformer-semantic-zoom.view.yaml"), aliases: true)
    representation = architecture.fetch("representations").find { |item| item.fetch("id") == "outer_product_mean_flattened" }
    board = view.fetch("boards").find { |item| item.fetch("id") == "outer_product_mean_detail" }

    assert_includes representation.fetch("semantic_role"), "row means are not subtracted"
    assert_includes board.fetch("summary"), "not covariance"
    assert_equal "modules.outer_product_mean", board.fetch("subject_ref")
    example = board.fetch("worked_examples").first
    assert_equal "msa_pair_outer_product", example.fetch("kind")
    assert_equal "AGVLSK", example.fetch("sequences").first
  end
end
