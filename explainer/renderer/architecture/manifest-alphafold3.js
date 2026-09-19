export const manifest = {
  "schemaVersion": "architecture-manifest-v0.5",
  "build": {
    "generator": "architecture-manifest-builder-v0.5.0",
    "inputDigests": {
      "references/bibliography.yaml": "82f709e900c8a4856e4b834e7d3d7269313b9e4aa08f6bea91d75c33ef974bdd",
      "architectures/alphafold3-pairformer.yaml": "b26bc51f2036bdc5f25fb316c124b72b82f6b5fa5be3aa1a210401979f462766",
      "views/alphafold3-pairformer-semantic-zoom.view.yaml": "f7b173b63de9150cabf4071c854c5f70899e941c46973b012d34d37aad33bbec",
      "pseudocode/alphafold3-pairformer.yaml": "babbe2e580f0f283bc953051127f5cba2fe2905f215334f3850e3794b229de27"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.5",
    "id": "alphafold3",
    "name": "AlphaFold 3",
    "family": "transformer",
    "status": "review",
    "taskModes": [
      "prediction"
    ],
    "referenceConfiguration": null,
    "sourceYaml": "../../architectures/alphafold3-pairformer.yaml",
    "sources": [
      {
        "source_ref": "af3_2024",
        "role": "architecture_source",
        "locator": "Fig. 2a and Supplementary Methods 3.6"
      },
      {
        "source_ref": "af3_pairformer_code",
        "role": "implementation_source",
        "locator": "PairFormerIteration, GridSelfAttention, TriangleMultiplication, and TransitionBlock"
      },
      {
        "source_ref": "af3_evoformer_code",
        "role": "configuration_source",
        "locator": "Evoformer.Config and Evoformer.__call__"
      },
      {
        "source_ref": "af3_self_attention_code",
        "role": "implementation_source",
        "locator": "SelfAttentionConfig and self_attention"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "af3_pairformer_code",
            "role": "implementation_evidence",
            "locator": "PairFormerIteration.__call__",
            "note": "The Pairformer half of the source set stops at the single and pair representations PairFormerIteration itself reads and writes."
          },
          {
            "source_ref": "af3_2024",
            "role": "paper_evidence",
            "locator": "Supplementary Algorithm 2 (InputFeatureEmbedder)",
            "note": "The source set's task-native boundary is now the raw per-token/per-atom input features InputFeatureEmbedder consumes (reference-conformer geometry, restype, profile, deletion_mean); single_state_input and pair_state_input are internal hand-offs produced from those features, not the architecture's own boundary."
          }
        ]
      }
    },
    "coverage": {
      "method": "declared_decomposition_closure",
      "scopes": {
        "architecture": {
          "status": "complete",
          "depth": 0,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.pairformer_stack",
            "modules.input_feature_embedder",
            "modules.single_state_input_projection",
            "modules.pair_state_input_projection",
            "modules.msa_module"
          ]
        },
        "modules.pairformer_stack": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 2,
          "immediateModuleRefs": [
            "modules.pair_update_stage",
            "modules.single_update_stage"
          ]
        },
        "modules.pair_update_stage": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.triangle_multiplication_outgoing",
            "modules.triangle_multiplication_incoming",
            "modules.pair_attention_starting_node",
            "modules.pair_attention_ending_node",
            "modules.pair_transition"
          ]
        },
        "modules.triangle_multiplication_outgoing": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.triangle_multiplication_incoming": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_attention_starting_node": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_attention_ending_node": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_transition": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_update_stage": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.single_pair_logits_projection",
            "modules.single_attention_with_pair_bias",
            "modules.single_transition"
          ]
        },
        "modules.single_pair_logits_projection": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_attention_with_pair_bias": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_transition": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.input_feature_embedder": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 2,
          "immediateModuleRefs": [
            "modules.atom_attention_encoder_bare",
            "modules.input_feature_concatenation"
          ]
        },
        "modules.atom_attention_encoder_bare": {
          "status": "opaque",
          "reason": "AtomAttentionEncoder (Algorithm 5) is the same reusable routine called a second time, in conditioned mode with real trunk single/pair and noisy-position arguments, inside the Diffusion Module. Modeling its internals here, against only this bare-mode call, would either duplicate that modeling effort or model only half the routine's real requirements; its internals become a reusable standard_block the first time a module actually needs them modeled, likely the Diffusion Module pass.",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.input_feature_concatenation": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_state_input_projection": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_state_input_projection": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.msa_module": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.msa_row_embedding",
            "modules.outer_product_mean",
            "modules.msa_pair_weighted_averaging",
            "modules.msa_transition",
            "modules.msa_pair_update_stage"
          ]
        },
        "modules.msa_row_embedding": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.outer_product_mean": {
          "status": "partial",
          "reason": "Real internal structure (the two independent a_si/b_si projections, the mean outer product, and the biased pair-channel compression) is modeled at value-site granularity rather than as further child modules; see the outer_product_mean_detail board.",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.msa_pair_weighted_averaging": {
          "status": "partial",
          "reason": "Real internal structure (the pair-derived per-head weights, the per-row value and gate projections, and the output projection) is modeled at value-site granularity rather than as further child modules; see the msa_pair_weighted_averaging_detail board.",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.msa_transition": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.msa_pair_update_stage": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.msa_triangle_multiplication_outgoing",
            "modules.msa_triangle_multiplication_incoming",
            "modules.msa_pair_attention_starting_node",
            "modules.msa_pair_attention_ending_node",
            "modules.msa_pair_transition"
          ]
        },
        "modules.msa_triangle_multiplication_outgoing": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.msa_triangle_multiplication_incoming": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.msa_pair_attention_starting_node": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.msa_pair_attention_ending_node": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.msa_pair_transition": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 28,
        "expandedScopeCount": 7,
        "completeExpandedScopeCount": 7,
        "partialScopeCount": 2,
        "leafFrontierCount": 18,
        "opaqueFrontierCount": 1,
        "partialFrontierCount": 2,
        "maximumAuthoredDepth": 3
      },
      "opaqueFrontierRefs": [
        "modules.atom_attention_encoder_bare"
      ],
      "partialScopeRefs": [
        "modules.outer_product_mean",
        "modules.msa_pair_weighted_averaging"
      ]
    },
    "modules": [
      {
        "id": "pairformer_stack",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Pairformer Stack",
        "kind": "refiner",
        "mechanisms": [
          "pair_reasoning",
          "pair_biased_single_attention"
        ],
        "role": "refine pair and single token representations through 48 independently parameterized blocks",
        "scale": "token_and_token_pair",
        "repeats": 48,
        "depth": {
          "blocks": 48
        },
        "pseudocode_ref": "../../pseudocode/alphafold3-pairformer.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack construction and application"
            }
          ]
        }
      },
      {
        "id": "pair_update_stage",
        "parent_ref": "modules.pairformer_stack",
        "decomposition": {
          "status": "complete"
        },
        "label": "Pair Track Update",
        "kind": "refiner",
        "mechanisms": [
          "triangle_multiplication",
          "axial_pair_attention",
          "transition"
        ],
        "role": "apply five ordered residual updates to the pair representation",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_outgoing",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Multiplication Outgoing",
        "kind": "operator",
        "mechanisms": [
          "triangle_multiplication",
          "gated_projection",
          "residual_update"
        ],
        "role": "aggregate products over shared outgoing edges and add the result to pair state",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "TriangleMultiplication.__call__ and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_incoming",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Multiplication Incoming",
        "kind": "operator",
        "mechanisms": [
          "triangle_multiplication",
          "gated_projection",
          "residual_update"
        ],
        "role": "aggregate products over shared incoming edges and add the result to pair state",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "TriangleMultiplication.__call__ and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_attention_starting_node",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Attention Starting Node",
        "kind": "attention",
        "mechanisms": [
          "axial_attention",
          "self_derived_pair_bias",
          "query_gating",
          "residual_update"
        ],
        "role": "update each ordered pair by attending along the starting-node pair-grid axis",
        "scale": "token_pair",
        "attention": {
          "pattern": "pair_grid_starting_node",
          "query_scale": "token_pair",
          "key_value_scale": "token_pair",
          "heads": 4,
          "pair_bias": true,
          "pair_bias_source": "normalized_pair_state",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "GridSelfAttention.__call__, GridSelfAttention._attention, and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_attention_ending_node",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Attention Ending Node",
        "kind": "attention",
        "mechanisms": [
          "axial_attention",
          "self_derived_pair_bias",
          "query_gating",
          "residual_update"
        ],
        "role": "transpose the pair grid, attend along the complementary ending-node axis, and add the result to pair state",
        "scale": "token_pair",
        "attention": {
          "pattern": "pair_grid_ending_node",
          "query_scale": "token_pair",
          "key_value_scale": "token_pair",
          "heads": 4,
          "pair_bias": true,
          "pair_bias_source": "normalized_pair_state",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "GridSelfAttention.__call__, GridSelfAttention._attention, and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_transition",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair Transition",
        "kind": "feed_forward",
        "mechanisms": [
          "layer_normalization",
          "swiglu",
          "residual_update"
        ],
        "role": "apply a pointwise 4x SwiGLU transition and add its 128-channel projection back to each pair entry",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "TransitionBlock.__call__ and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_update_stage",
        "parent_ref": "modules.pairformer_stack",
        "decomposition": {
          "status": "complete"
        },
        "label": "Single Track Update",
        "kind": "refiner",
        "mechanisms": [
          "pair_logit_projection",
          "self_attention",
          "transition"
        ],
        "role": "use the updated pair state to bias token self-attention, then apply a token-wise transition",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_pair_logits_projection",
        "parent_ref": "modules.single_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Project Pair Attention Bias",
        "kind": "adapter",
        "mechanisms": [
          "layer_normalization",
          "linear_projection"
        ],
        "role": "normalize the updated pair state and project each token pair to 16 single-attention head logits",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_attention_with_pair_bias",
        "parent_ref": "modules.single_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Single Attention with Pair Bias",
        "kind": "attention",
        "mechanisms": [
          "full_attention",
          "pair_logit_bias",
          "query_gating",
          "residual_update"
        ],
        "role": "update each token state with 16-head self-attention whose logits receive the projected pair bias",
        "scale": "token",
        "attention": {
          "pattern": "full",
          "query_scale": "token",
          "key_value_scale": "token",
          "heads": 16,
          "pair_bias": true,
          "pair_bias_source": "updated_pair_state",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "callsite_evidence",
              "locator": "PairFormerIteration single_attention_ call"
            },
            {
              "source_ref": "af3_self_attention_code",
              "role": "implementation_evidence",
              "locator": "self_attention"
            }
          ]
        }
      },
      {
        "id": "single_transition",
        "parent_ref": "modules.single_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Single Transition",
        "kind": "feed_forward",
        "mechanisms": [
          "layer_normalization",
          "swiglu",
          "residual_update"
        ],
        "role": "apply a pointwise 4x SwiGLU transition and add its 384-channel projection back to each token state",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "TransitionBlock.__call__ and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "input_feature_embedder",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Input Feature Embedder",
        "kind": "encoder",
        "mechanisms": [
          "atom_attention_encoding",
          "per_token_feature_concatenation"
        ],
        "role": "build s_inputs by mean-pooling a bare-mode AtomAttentionEncoder pass over each token's isolated reference-conformer geometry, then concatenating that per-token vector with restype, profile, and deletion_mean",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 (InputFeatureEmbedder)"
            }
          ]
        }
      },
      {
        "id": "atom_attention_encoder_bare",
        "parent_ref": "modules.input_feature_embedder",
        "decomposition": {
          "status": "opaque",
          "reason": "AtomAttentionEncoder (Algorithm 5) is the same reusable routine called a second time, in conditioned mode with real trunk single/pair and noisy-position arguments, inside the Diffusion Module. Modeling its internals here, against only this bare-mode call, would either duplicate that modeling effort or model only half the routine's real requirements; its internals become a reusable standard_block the first time a module actually needs them modeled, likely the Diffusion Module pass."
        },
        "label": "Atom Attention Encoder (bare mode)",
        "kind": "encoder",
        "mechanisms": [
          "sequence_local_atom_attention",
          "per_atom_to_per_token_mean_pooling"
        ],
        "role": "encode each token's isolated reference-conformer geometry and identity into one per-token vector via local self-attention over that token's own atoms, with no trunk single/pair or noisy-position conditioning",
        "scale": "atom",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 5 (AtomAttentionEncoder), called from Supplementary Algorithm 2 line 1 with {r_l}, {s_trunk}, {z_ij} all None"
            }
          ]
        }
      },
      {
        "id": "input_feature_concatenation",
        "parent_ref": "modules.input_feature_embedder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Input Feature Concatenation",
        "kind": "operator",
        "mechanisms": [
          "feature_concatenation"
        ],
        "role": "concatenate the pooled per-token atom encoding with restype, profile, and deletion_mean to produce s_inputs",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (concat(a_i, f_i^restype, f_i^profile, f_i^deletion_mean))"
            }
          ]
        }
      },
      {
        "id": "single_state_input_projection",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Project Single State Input",
        "kind": "adapter",
        "mechanisms": [
          "linear_projection"
        ],
        "role": "project s_inputs to the 384-channel single_state_input via one LinearNoBias layer",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 1 line 2 (s_init = LinearNoBias(s_inputs))"
            }
          ]
        }
      },
      {
        "id": "pair_state_input_projection",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Project Pair State Input",
        "kind": "adapter",
        "mechanisms": [
          "linear_projection",
          "outer_sum"
        ],
        "role": "project s_inputs to 128 channels via two independent LinearNoBias layers, one per token of the pair, and outer-sum them into pair_state_input",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 1 line 3 (z_init_ij = LinearNoBias(s_i^inputs) + LinearNoBias(s_j^inputs); lines 4-5's RelativePositionEncoding and token_bonds contributions to z_init are separate inputs not modeled by this module)"
            }
          ]
        }
      },
      {
        "id": "msa_module",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "MSA Module",
        "kind": "refiner",
        "mechanisms": [
          "msa_row_embedding",
          "outer_product_mean",
          "msa_pair_weighted_averaging",
          "transition",
          "triangle_multiplication",
          "axial_pair_attention"
        ],
        "role": "embed raw per-row MSA features (one-hot sequence identity, deletion flags/values) plus s_inputs into per-row MSA activations, then read those activations into OuterProductMean to contribute evolutionary coupling into the pair representation; update the MSA activations via MSAPairWeightedAveraging (attention whose weights come entirely from the pair representation) followed by a Transition; and run the resulting pair state through the module's own pair-stack (triangle multiplication x2, triangle attention x2, transition), architecturally identical to the Pairformer's own pair-stack mechanism but with its own parameters, run N_block=4 times instead of 48; only z_ij is returned, the MSA representation itself is discarded every call; only one representative pass through the module is modeled here, not the N_block=4 loop or the outer per-recycle loop",
        "scale": "msa",
        "repeats": 4,
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 (MsaModule), lines 1-15"
            }
          ]
        }
      },
      {
        "id": "msa_row_embedding",
        "parent_ref": "modules.msa_module",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MSA Row Embedding",
        "kind": "adapter",
        "mechanisms": [
          "feature_concatenation",
          "linear_projection",
          "additive_conditioning"
        ],
        "role": "concatenate each MSA row's raw one-hot identity, deletion flag, and deletion value features and linearly embed them to c_m=64 via one LinearNoBias layer, then add s_inputs (via a separate LinearNoBias layer) into every row identically",
        "scale": "msa",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 1, 3-4"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean",
        "parent_ref": "modules.msa_module",
        "decomposition": {
          "status": "partial",
          "reason": "Real internal structure (the two independent a_si/b_si projections, the mean outer product, and the biased pair-channel compression) is modeled at value-site granularity rather than as further child modules; see the outer_product_mean_detail board."
        },
        "label": "Outer Product Mean",
        "kind": "operator",
        "mechanisms": [
          "layer_normalization",
          "linear_projection",
          "outer_product",
          "mean_pooling",
          "biased_linear_projection"
        ],
        "role": "normalize the MSA activations, project them into two independent c=32 factors, form the outer product of the two factors for every token pair, average that outer product over all MSA rows and flatten it to a 1024-channel vector, then compress it with one bias-carrying Linear layer (the one exception to LinearNoBias in this mechanism) into a 128-channel contribution to the pair representation; the only place in the model where evolutionary coupling across the MSA enters the pair representation",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 (OuterProductMean); called from Algorithm 8 line 6"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging",
        "parent_ref": "modules.msa_module",
        "decomposition": {
          "status": "partial",
          "reason": "Real internal structure (the pair-derived per-head weights, the per-row value and gate projections, and the output projection) is modeled at value-site granularity rather than as further child modules; see the msa_pair_weighted_averaging_detail board."
        },
        "label": "MSA Pair Weighted Averaging",
        "kind": "attention",
        "mechanisms": [
          "layer_normalization",
          "linear_projection",
          "pair_derived_attention_weights",
          "gated_projection",
          "residual_update"
        ],
        "role": "normalize the MSA activations and project per-head values and a per-head sigmoid gate from them; separately project a per-head attention logit from the LayerNorm'd pair representation and softmax-normalize it over the key token axis to get attention weights that depend only on the pair representation, never on MSA row content, so every row is pulled through the exact same shared routing table; gate each row's weighted average of values by that row's own gate, concatenate heads, project back to c_m=64 with one LinearNoBias layer, and add the result back into the MSA activations",
        "scale": "msa",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 (MSA pair weighted averaging with gating); called from Algorithm 8 line 7 with c=8, N_head=8"
            }
          ]
        }
      },
      {
        "id": "msa_transition",
        "parent_ref": "modules.msa_module",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MSA Transition",
        "kind": "feed_forward",
        "mechanisms": [
          "layer_normalization",
          "swiglu",
          "residual_update"
        ],
        "role": "apply a pointwise 4x SwiGLU transition and add its 64-channel (c_m) projection back to each MSA row activation",
        "scale": "msa",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 8 ({m_si} += Transition({m_si})); Algorithm 11 (Transition, a shared SwiGLU utility also independently instantiated by single_transition and pair_transition elsewhere in this source set)"
            }
          ]
        }
      },
      {
        "id": "msa_pair_update_stage",
        "parent_ref": "modules.msa_module",
        "decomposition": {
          "status": "complete"
        },
        "label": "MSA Module Pair Stack",
        "kind": "refiner",
        "mechanisms": [
          "triangle_multiplication",
          "axial_pair_attention",
          "transition"
        ],
        "role": "apply five ordered residual updates to the pair representation; architecturally identical to the Pairformer's own pair-stack (own parameters, not shared weights), run here 4 times instead of 48",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 (TriangleMultiplicationOutgoing, TriangleMultiplicationIncoming, TriangleAttentionStartingNode, TriangleAttentionEndingNode, Transition)"
            }
          ]
        }
      },
      {
        "id": "msa_triangle_multiplication_outgoing",
        "parent_ref": "modules.msa_pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MSA Triangle Multiplication Outgoing",
        "kind": "operator",
        "mechanisms": [
          "triangle_multiplication",
          "gated_projection",
          "residual_update"
        ],
        "role": "aggregate products over shared outgoing edges and add the result to the pair representation; the same TriangleMultiplicationOutgoing mechanism the Pairformer uses (own parameters, not shared weights), run here as the first step of the MSA module's own N_block=4 pair-stack instead of the Pairformer's 48-block stack",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 9 ({z_ij} += DropoutRowwise_0.25(TriangleMultiplicationOutgoing({z_ij}))); Algorithm 12 (TriangleMultiplicationOutgoing) -- same DropoutRowwise_0.25 scheme as the Pairformer's own Algorithm 17 line 2, not modeled as its own fact here (dropout is not modeled anywhere else in this source set, including the Pairformer's own pair-stack)"
            }
          ]
        }
      },
      {
        "id": "msa_triangle_multiplication_incoming",
        "parent_ref": "modules.msa_pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MSA Triangle Multiplication Incoming",
        "kind": "operator",
        "mechanisms": [
          "triangle_multiplication",
          "gated_projection",
          "residual_update"
        ],
        "role": "aggregate products over shared incoming edges and add the result to the pair representation; the same TriangleMultiplicationIncoming mechanism the Pairformer uses (own parameters, not shared weights), run here as the second step of the MSA module's own pair-stack",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 10 ({z_ij} += DropoutRowwise_0.25(TriangleMultiplicationIncoming({z_ij}))); Algorithm 13 (TriangleMultiplicationIncoming) -- same DropoutRowwise_0.25 scheme as the Pairformer's own Algorithm 17 line 3, not modeled as its own fact here"
            }
          ]
        }
      },
      {
        "id": "msa_pair_attention_starting_node",
        "parent_ref": "modules.msa_pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MSA Triangle Attention Starting Node",
        "kind": "attention",
        "mechanisms": [
          "axial_attention",
          "self_derived_pair_bias",
          "query_gating",
          "residual_update"
        ],
        "role": "update each ordered pair by attending along the starting-node pair-grid axis; the same TriangleAttentionStartingNode mechanism the Pairformer uses (own parameters, not shared weights), run here as the third step of the MSA module's own pair-stack",
        "scale": "token_pair",
        "attention": {
          "pattern": "pair_grid_starting_node",
          "query_scale": "token_pair",
          "key_value_scale": "token_pair",
          "heads": 4,
          "pair_bias": true,
          "pair_bias_source": "normalized_pair_state",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 11 ({z_ij} += DropoutRowwise_0.25(TriangleAttentionStartingNode({z_ij}))); Algorithm 14 (TriangleAttentionStartingNode, N_head=4, c=32) -- same DropoutRowwise_0.25 scheme as the Pairformer's own Algorithm 17 line 4, not modeled as its own fact here"
            }
          ]
        }
      },
      {
        "id": "msa_pair_attention_ending_node",
        "parent_ref": "modules.msa_pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MSA Triangle Attention Ending Node",
        "kind": "attention",
        "mechanisms": [
          "axial_attention",
          "self_derived_pair_bias",
          "query_gating",
          "residual_update"
        ],
        "role": "transpose the pair grid, attend along the complementary ending-node axis, and add the result to the pair representation; the same TriangleAttentionEndingNode mechanism the Pairformer uses (own parameters, not shared weights), run here as the fourth step of the MSA module's own pair-stack",
        "scale": "token_pair",
        "attention": {
          "pattern": "pair_grid_ending_node",
          "query_scale": "token_pair",
          "key_value_scale": "token_pair",
          "heads": 4,
          "pair_bias": true,
          "pair_bias_source": "normalized_pair_state",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 12 ({z_ij} += DropoutColumnwise_0.25(TriangleAttentionEndingNode({z_ij}))); Algorithm 15 (TriangleAttentionEndingNode, N_head=4, c=32) -- same DropoutColumnwise_0.25 scheme as the Pairformer's own Algorithm 17 line 5 (columnwise here, unlike the other three steps' rowwise dropout, since this step attends along the transposed axis), not modeled as its own fact here"
            }
          ]
        }
      },
      {
        "id": "msa_pair_transition",
        "parent_ref": "modules.msa_pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MSA Pair Transition",
        "kind": "feed_forward",
        "mechanisms": [
          "layer_normalization",
          "swiglu",
          "residual_update"
        ],
        "role": "apply a pointwise 4x SwiGLU transition and add its 128-channel projection back to each pair entry; the same Transition mechanism the Pairformer's own pair_transition uses (own parameters, not shared weights), run here as the final step of the MSA module's own pair-stack, whose output is the module's returned z_ij",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 13 ({z_ij} += Transition({z_ij})); Algorithm 11 (Transition) -- no dropout on this step, matching the Pairformer's own pair_transition (Algorithm 17 line 6)"
            }
          ]
        }
      }
    ],
    "blockInstances": [

    ],
    "representations": [
      {
        "id": "single_state",
        "scale": "token",
        "semantic_role": "mutable token-wise trunk representation",
        "shape": "N_token x 384",
        "glyph": "single",
        "carries": [
          "token context",
          "trunk single features"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_state",
        "scale": "token_pair",
        "semantic_role": "mutable ordered token-pair trunk representation",
        "shape": "N_token x N_token x 128",
        "glyph": "pair",
        "carries": [
          "pairwise token context",
          "relational geometry evidence"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "token_mask",
        "scale": "token",
        "semantic_role": "valid-token mask for single attention",
        "shape": "N_token",
        "glyph": "vector",
        "carries": [
          "token validity"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "shape_evidence",
              "locator": "PairFormerIteration.__call__ seq_mask argument"
            }
          ]
        }
      },
      {
        "id": "pair_mask",
        "scale": "token_pair",
        "semantic_role": "valid-token-pair mask for pair updates",
        "shape": "N_token x N_token",
        "glyph": "matrix",
        "carries": [
          "pair validity"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "shape_evidence",
              "locator": "PairFormerIteration.__call__ pair_mask argument"
            }
          ]
        }
      },
      {
        "id": "pair_attention_logits",
        "scale": "token_pair",
        "semantic_role": "per-head additive bias for token self-attention",
        "shape": "16 x N_token x N_token",
        "glyph": "volume",
        "carries": [
          "pair-derived attention logits"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "shape_evidence",
              "locator": "single_pair_logits_projection and transpose"
            },
            {
              "source_ref": "af3_self_attention_code",
              "role": "configuration_evidence",
              "locator": "SelfAttentionConfig.num_head=16"
            }
          ]
        }
      },
      {
        "id": "atom_reference_features",
        "scale": "atom",
        "semantic_role": "raw per-atom reference-conformer geometry and identity, the slice of f* that AtomAttentionEncoder consumes in bare mode",
        "shape": "heterogeneous fields sharing an N_atom prefix (see field_groups)",
        "glyph": "dictionary",
        "carries": [
          "isolated reference-conformer 3D position per atom",
          "element and formal charge identity per atom",
          "character-encoded atom name per atom",
          "same-instance (residue/ligand) grouping used to mask cross-instance atom pairs"
        ],
        "field_groups": [
          {
            "id": "reference_conformer_geometry_and_identity",
            "label": "Reference conformer geometry and identity",
            "axis": "atom",
            "shape": "N_atom x {ref_pos: 3, ref_mask: 1, ref_element: 128, ref_charge: 1, ref_atom_name_chars: 4x64, ref_space_uid: 1}",
            "fields": [
              "ref_pos",
              "ref_mask",
              "ref_element",
              "ref_charge",
              "ref_atom_name_chars",
              "ref_space_uid"
            ],
            "semantic_role": "Each atom's isolated idealized 3D shape (reference conformer, randomly rotated/translated), independent of any other token's conformer, plus the identity and same-instance grouping fields AtomAttentionEncoder needs to mask cross-instance atom pairs.",
            "evidence": {
              "status": "confirmed_from_paper",
              "refs": [
                {
                  "source_ref": "af3_2024",
                  "role": "paper_evidence",
                  "locator": "Supplementary Table 5 (ref_pos, ref_mask, ref_element, ref_charge, ref_atom_name_chars, ref_space_uid)"
                }
              ]
            }
          }
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 5 (per-atom reference-conformer embedding and pairwise validity masking); Supplementary Table 5 (raw feature list)"
            }
          ]
        }
      },
      {
        "id": "restype",
        "scale": "token",
        "semantic_role": "one-hot per-token sequence identity (residue/nucleotide/ligand-as-unknown-amino-acid), concatenated directly into s_inputs",
        "shape": "N_token x 32",
        "glyph": "matrix",
        "carries": [
          "one-hot residue/nucleotide/ligand type per token"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (f_i^restype); Supplementary Table 5 restype [N_token, 32]"
            }
          ]
        }
      },
      {
        "id": "profile",
        "scale": "token",
        "semantic_role": "per-token MSA amino-acid distribution, a compressed evolutionary summary computed before MSA processing, concatenated directly into s_inputs",
        "shape": "N_token x 32",
        "glyph": "matrix",
        "carries": [
          "per-column amino-acid distribution from the main MSA"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (f_i^profile); Supplementary Table 5 profile [N_token, 32]"
            }
          ]
        }
      },
      {
        "id": "deletion_mean",
        "scale": "token",
        "semantic_role": "per-token mean MSA deletion rate, computed before MSA processing, concatenated directly into s_inputs",
        "shape": "N_token",
        "glyph": "vector",
        "carries": [
          "average deletion rate at this token's MSA column"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (f_i^deletion_mean); Supplementary Table 5 deletion_mean [N_token]"
            }
          ]
        }
      },
      {
        "id": "pooled_atom_encoding",
        "scale": "token",
        "semantic_role": "AtomAttentionEncoder's mean-pooled per-atom output for each token (a_i), fed into the input feature concatenation; shares a channel count with single_state (both 384, c_token) but is a distinct tensor, produced before the trunk's single_state even exists",
        "shape": "N_token x 384",
        "glyph": "single",
        "carries": [
          "mean-pooled per-atom reference-conformer encoding"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 5 line 16 (a_i = mean(relu(LinearNoBias(q_l)))); Supplementary Algorithm 2 line 1 (c_token=384)"
            }
          ]
        }
      },
      {
        "id": "s_inputs",
        "scale": "token",
        "semantic_role": "the concatenated per-token input embedding (s_inputs); AtomAttentionEncoder's pooled per-token vector concatenated with restype, profile, and deletion_mean, and the single independent source that single_state_input and pair_state_input are each separately linearly projected from",
        "shape": "N_token x 449",
        "glyph": "matrix",
        "carries": [
          "pooled per-atom reference-conformer encoding (384 channels, c_token)",
          "one-hot restype (32 channels)",
          "MSA profile (32 channels)",
          "deletion mean (1 channel)"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (s_i = concat(a_i, f_i^restype, f_i^profile, f_i^deletion_mean); a_i in R^384 per Algorithm 2 line 1's c_token=384, restype/profile each [N_token, 32] and deletion_mean [N_token] per Supplementary Table 5, giving 384+32+32+1=449 channels)"
            }
          ]
        }
      },
      {
        "id": "msa_identity",
        "scale": "msa",
        "semantic_role": "raw one-hot encoding of the processed MSA, using the same 32 classes as restype, per MSA row and per token position",
        "shape": "N_msa x N_token x 32",
        "glyph": "volume",
        "carries": [
          "one-hot residue/nucleotide/gap identity for each MSA row at each token position"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Table 5 msa [N_msa, N_token, 32]; Supplementary Algorithm 8 line 1 (f_Si^msa)"
            }
          ]
        }
      },
      {
        "id": "has_deletion",
        "scale": "msa",
        "semantic_role": "raw binary feature indicating whether a deletion occurs immediately to the left of each MSA position",
        "shape": "N_msa x N_token",
        "glyph": "matrix",
        "carries": [
          "deletion-present flag for each MSA row at each token position"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Table 5 has_deletion [N_msa, N_token]; Supplementary Algorithm 8 line 1 (f_Si^has_deletion)"
            }
          ]
        }
      },
      {
        "id": "deletion_value",
        "scale": "msa",
        "semantic_role": "raw deletion count to the left of each MSA position, transformed to [0, 1]",
        "shape": "N_msa x N_token",
        "glyph": "matrix",
        "carries": [
          "transformed deletion count for each MSA row at each token position"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Table 5 deletion_value [N_msa, N_token] ((2/pi)*arctan(d/3) transform of the raw deletion count d); Supplementary Algorithm 8 line 1 (f_Si^deletion_value)"
            }
          ]
        }
      },
      {
        "id": "msa_activations",
        "scale": "msa",
        "semantic_role": "per-row, per-token MSA activation after linearly embedding the concatenated raw row features and adding s_inputs into every row; the shared per-block read for both OuterProductMean and MSAPairWeightedAveraging",
        "shape": "N_msa x N_token x 64",
        "glyph": "volume",
        "carries": [
          "linearly embedded concatenation of raw MSA identity, deletion-flag, and deletion-value features",
          "s_inputs added identically into every MSA row"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 1, 3-4 (m_Si = concat(f_Si^msa, f_Si^has_deletion, f_Si^deletion_value); m_si <- LinearNoBias(m_si), m_si in R^c_m; m_si += LinearNoBias(s_i^inputs); c_m=64 per the MsaModule signature)"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_projection_a",
        "scale": "msa",
        "semantic_role": "OuterProductMean's first of two independent LinearNoBias projections of the LayerNorm'd MSA activations, narrowed to c=32 channels; used as the outer product's per-token-i factor",
        "shape": "N_msa x N_token x 32",
        "glyph": "volume",
        "carries": [
          "row-and-token-specific learned feature, the left factor of the outer product"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 lines 1-2 (m_si <- LayerNorm(m_si); a_si, b_si = LinearNoBias(m_si), a_si/b_si in R^c, c=32)"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_projection_b",
        "scale": "msa",
        "semantic_role": "OuterProductMean's second of two independent LinearNoBias projections of the LayerNorm'd MSA activations, narrowed to c=32 channels; used as the outer product's per-token-j factor",
        "shape": "N_msa x N_token x 32",
        "glyph": "volume",
        "carries": [
          "row-and-token-specific learned feature, the right factor of the outer product"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 lines 1-2 (m_si <- LayerNorm(m_si); a_si, b_si = LinearNoBias(m_si), a_si/b_si in R^c, c=32)"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_flattened",
        "scale": "token_pair",
        "semantic_role": "for every token pair, the outer product of projection_a at token i and projection_b at token j, averaged over all MSA rows and flattened; an empirical cross-covariance between the two learned projections, computed across the MSA's rows, the architectural analogue of coevolution-based contact statistics",
        "shape": "N_token x N_token x 1024",
        "glyph": "pair",
        "carries": [
          "flattened c-by-c (32 x 32 = 1024) mean outer product across MSA rows"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 line 3 (o_ij = flatten(mean_s(a_si tensor-product b_sj)), o_ij in R^(c*c), c=32 so c*c=1024)"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_value",
        "scale": "msa",
        "semantic_role": "MSAPairWeightedAveraging's per-head, per-row value projection of the LayerNorm'd MSA activations; the row-specific content the shared, pair-derived attention weights are applied to",
        "shape": "N_msa x N_token x 8 x 8",
        "glyph": "volume",
        "carries": [
          "per-head (8 heads), per-row, per-token value vector (8 channels each, c=8 as called from MsaModule)"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 lines 1-2 (m_si <- LayerNorm(m_si); v_si^h = LinearNoBias(m_si), v_si^h in R^c, h in {1,...,N_head}); Algorithm 8 line 7 (called with c=8, N_head=8)"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_pair_bias",
        "scale": "token_pair",
        "semantic_role": "per-head attention logit computed once per token pair from the LayerNorm'd pair representation; computed once per block and shared identically across every MSA row, since it never depends on row content",
        "shape": "8 x N_token x N_token",
        "glyph": "pair",
        "carries": [
          "per-head, pair-derived attention logit, with no dependence on MSA row content"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 3 (b_ij^h = LinearNoBias(LayerNorm(z_ij)))"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_gate",
        "scale": "msa",
        "semantic_role": "per-row, per-head sigmoid gate computed from the row's own LayerNorm'd activation; the only row-specific control over how much of the shared weighted average reaches that row's output",
        "shape": "N_msa x N_token x 8 x 8",
        "glyph": "volume",
        "carries": [
          "per-head (8 heads), per-row, per-token sigmoid gate (8 channels each)"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 4 (g_si^h = sigmoid(LinearNoBias(m_si)), g_si^h in R^c)"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_weights",
        "scale": "token_pair",
        "semantic_role": "softmax-normalized, pair-derived attention weight, shared identically across every MSA row; the routing table MSAPairWeightedAveraging applies uniformly to every row's values",
        "shape": "8 x N_token x N_token",
        "glyph": "pair",
        "carries": [
          "per-head attention weight, softmax-normalized over the key token axis j, with no dependence on MSA row content"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 5 (w_ij^h = softmax_j(b_ij^h))"
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "single_state_input",
        "representation_ref": "representations.single_state",
        "scope_ref": "architecture",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_state_input",
        "representation_ref": "representations.pair_state",
        "scope_ref": "architecture",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "token_mask_input",
        "representation_ref": "representations.token_mask",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_input",
        "representation_ref": "representations.pair_mask",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "atom_reference_features_input",
        "representation_ref": "representations.atom_reference_features",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 1 (f* passed into AtomAttentionEncoder)"
            }
          ]
        }
      },
      {
        "id": "restype_input",
        "representation_ref": "representations.restype",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (f_i^restype)"
            }
          ]
        }
      },
      {
        "id": "profile_input",
        "representation_ref": "representations.profile",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (f_i^profile)"
            }
          ]
        }
      },
      {
        "id": "deletion_mean_input",
        "representation_ref": "representations.deletion_mean",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (f_i^deletion_mean)"
            }
          ]
        }
      },
      {
        "id": "s_inputs",
        "representation_ref": "representations.s_inputs",
        "scope_ref": "architecture",
        "role": "assembled_input_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2; Supplementary Algorithm 1 lines 2-3 (independently read by both the single_state_input and pair_state_input projections)"
            }
          ]
        }
      },
      {
        "id": "z_init",
        "representation_ref": "representations.pair_state",
        "scope_ref": "architecture",
        "role": "outer_sum_projected_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 1 line 3 (z_init_ij = LinearNoBias(s_i^inputs) + LinearNoBias(s_j^inputs)); Algorithm 8 signature ({z_ij} passed into MsaModule as its second argument) -- the pair representation as it exists right after the outer-sum projection of s_inputs, before Template/MSA processing; only one representative pass is modeled, so this value site stands in for what Algorithm 1 line 8 would otherwise reconstruct at the start of every recycle"
            }
          ]
        }
      },
      {
        "id": "block_pair_state",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pairformer_stack",
        "role": "pairformer_block_pair_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_after_outgoing_multiplication",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pair_update_stage",
        "role": "outgoing_triangle_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_after_incoming_multiplication",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pair_update_stage",
        "role": "incoming_triangle_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_after_starting_attention",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pair_update_stage",
        "role": "starting_node_attention_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_after_ending_attention",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pair_update_stage",
        "role": "ending_node_attention_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_after_transition",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pairformer_stack",
        "role": "pairformer_block_pair_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "block_single_state",
        "representation_ref": "representations.single_state",
        "scope_ref": "modules.pairformer_stack",
        "role": "pairformer_block_single_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "single_pair_attention_logits",
        "representation_ref": "representations.pair_attention_logits",
        "scope_ref": "modules.single_update_stage",
        "role": "pair_derived_single_attention_bias",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_after_pair_attention",
        "representation_ref": "representations.single_state",
        "scope_ref": "modules.single_update_stage",
        "role": "attention_updated_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "single_after_transition",
        "representation_ref": "representations.single_state",
        "scope_ref": "modules.pairformer_stack",
        "role": "pairformer_block_single_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "single_state_output",
        "representation_ref": "representations.single_state",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "component_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_state_output",
        "representation_ref": "representations.pair_state",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "component_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "msa_input",
        "representation_ref": "representations.msa_identity",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "raw_msa_identity_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 1 (f_Si^msa)"
            }
          ]
        }
      },
      {
        "id": "has_deletion_input",
        "representation_ref": "representations.has_deletion",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "raw_deletion_flag_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 1 (f_Si^has_deletion)"
            }
          ]
        }
      },
      {
        "id": "deletion_value_input",
        "representation_ref": "representations.deletion_value",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "raw_deletion_value_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 1 (f_Si^deletion_value)"
            }
          ]
        }
      },
      {
        "id": "msa_activations",
        "representation_ref": "representations.msa_activations",
        "scope_ref": "modules.msa_row_embedding",
        "role": "row_setup_output",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 1, 3-4; read by OuterProductMean (line 6) and MSAPairWeightedAveraging (line 7)"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_projection_a",
        "representation_ref": "representations.outer_product_mean_projection_a",
        "scope_ref": "modules.outer_product_mean",
        "role": "outer_product_left_factor",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 line 2"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_projection_b",
        "representation_ref": "representations.outer_product_mean_projection_b",
        "scope_ref": "modules.outer_product_mean",
        "role": "outer_product_right_factor",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 line 2"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_flattened",
        "representation_ref": "representations.outer_product_mean_flattened",
        "scope_ref": "modules.outer_product_mean",
        "role": "flattened_outer_product_mean",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 line 3"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_pair_contribution",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.outer_product_mean",
        "role": "communication_pair_contribution",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 line 4 (z_ij = Linear(o_ij), z_ij in R^c_z, c_z=128); Algorithm 8 line 6 ({z_ij} += OuterProductMean({m_si})) -- this value site is OuterProductMean's own returned contribution, added into value_sites.msa_module_pair_state_read alongside value_sites.z_init by relations.outer_product_mean_contribution_updates_msa_module_pair_state"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_value",
        "representation_ref": "representations.msa_pair_weighted_averaging_value",
        "scope_ref": "modules.msa_pair_weighted_averaging",
        "role": "pair_weighted_averaging_value_projection",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 2"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_pair_bias",
        "representation_ref": "representations.msa_pair_weighted_averaging_pair_bias",
        "scope_ref": "modules.msa_pair_weighted_averaging",
        "role": "pair_weighted_averaging_pair_bias",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 3"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_gate",
        "representation_ref": "representations.msa_pair_weighted_averaging_gate",
        "scope_ref": "modules.msa_pair_weighted_averaging",
        "role": "pair_weighted_averaging_gate",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 4"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_weights",
        "representation_ref": "representations.msa_pair_weighted_averaging_weights",
        "scope_ref": "modules.msa_pair_weighted_averaging",
        "role": "pair_weighted_averaging_attention_weights",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 5"
            }
          ]
        }
      },
      {
        "id": "msa_module_pair_state_read",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.msa_module",
        "role": "post_communication_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 6-9 -- z_ij as it stands right after OuterProductMean's communication write (line 6), before MSAPairWeightedAveraging reads it to condition attention (line 7) and before the pair-stack's first step reads it (line 9); lines 7-8 update only {m_si}, never {z_ij}, so this is the same value read at both points. Re-scoped from modules.msa_pair_weighted_averaging (its original, narrower scope when only the MSA-stack read was modeled) to modules.msa_module now that it also feeds this module's own pair-stack."
            }
          ]
        }
      },
      {
        "id": "msa_activations_after_pair_weighted_averaging",
        "representation_ref": "representations.msa_activations",
        "scope_ref": "modules.msa_pair_weighted_averaging",
        "role": "pair_weighted_averaging_updated_row_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 lines 6-7; Algorithm 8 line 7 ({m_si} += DropoutRowwise_0.15(MSAPairWeightedAveraging(...)))"
            }
          ]
        }
      },
      {
        "id": "msa_activations_after_transition",
        "representation_ref": "representations.msa_activations",
        "scope_ref": "modules.msa_transition",
        "role": "transition_updated_row_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 8 ({m_si} += Transition({m_si})); Algorithm 11 (Transition)"
            }
          ]
        }
      },
      {
        "id": "msa_pair_after_outgoing_multiplication",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.msa_pair_update_stage",
        "role": "msa_module_outgoing_triangle_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 9"
            }
          ]
        }
      },
      {
        "id": "msa_pair_after_incoming_multiplication",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.msa_pair_update_stage",
        "role": "msa_module_incoming_triangle_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 10"
            }
          ]
        }
      },
      {
        "id": "msa_pair_after_starting_attention",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.msa_pair_update_stage",
        "role": "msa_module_starting_node_attention_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 11"
            }
          ]
        }
      },
      {
        "id": "msa_pair_after_ending_attention",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.msa_pair_update_stage",
        "role": "msa_module_ending_node_attention_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 12"
            }
          ]
        }
      },
      {
        "id": "msa_pair_after_transition",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.msa_module",
        "role": "msa_module_final_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 13; line 15 (#kw[return] {z_ij}) -- this is the module's own returned z_ij, the final value written into value_sites.pair_state_input"
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "single_state_input": {
        "incomingRelationRefs": [
          "relations.single_state_projection_produces_single_state_input"
        ],
        "outgoingRelationRefs": [
          "relations.input_single_state_initializes_block_single_state"
        ],
        "producerRefs": [
          "modules.single_state_input_projection"
        ],
        "consumerRefs": [
          "value_sites.block_single_state"
        ]
      },
      "pair_state_input": {
        "incomingRelationRefs": [
          "relations.msa_module_pair_output_becomes_pair_state_input"
        ],
        "outgoingRelationRefs": [
          "relations.input_pair_state_initializes_block_pair_state"
        ],
        "producerRefs": [
          "value_sites.msa_pair_after_transition"
        ],
        "consumerRefs": [
          "value_sites.block_pair_state"
        ]
      },
      "token_mask_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.token_mask_conditions_single_attention"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.single_attention_with_pair_bias"
        ]
      },
      "pair_mask_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.pair_mask_conditions_outgoing_multiplication",
          "relations.pair_mask_conditions_incoming_multiplication",
          "relations.pair_mask_conditions_starting_attention",
          "relations.pair_mask_conditions_ending_attention"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.triangle_multiplication_outgoing",
          "modules.triangle_multiplication_incoming",
          "modules.pair_attention_starting_node",
          "modules.pair_attention_ending_node"
        ]
      },
      "atom_reference_features_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.atom_reference_features_enter_atom_attention_encoder"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.atom_attention_encoder_bare"
        ]
      },
      "restype_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.restype_enters_concatenation"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.input_feature_concatenation"
        ]
      },
      "profile_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.profile_enters_concatenation"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.input_feature_concatenation"
        ]
      },
      "deletion_mean_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.deletion_mean_enters_concatenation"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.input_feature_concatenation"
        ]
      },
      "s_inputs": {
        "incomingRelationRefs": [
          "relations.concatenation_produces_s_inputs"
        ],
        "outgoingRelationRefs": [
          "relations.s_inputs_enters_single_state_projection",
          "relations.s_inputs_enters_pair_state_projection",
          "relations.s_inputs_enters_msa_row_embedding"
        ],
        "producerRefs": [
          "modules.input_feature_concatenation"
        ],
        "consumerRefs": [
          "modules.single_state_input_projection",
          "modules.pair_state_input_projection",
          "modules.msa_row_embedding"
        ]
      },
      "z_init": {
        "incomingRelationRefs": [
          "relations.pair_state_projection_produces_z_init"
        ],
        "outgoingRelationRefs": [
          "relations.z_init_initializes_msa_module_pair_state"
        ],
        "producerRefs": [
          "modules.pair_state_input_projection"
        ],
        "consumerRefs": [
          "value_sites.msa_module_pair_state_read"
        ]
      },
      "block_pair_state": {
        "incomingRelationRefs": [
          "relations.input_pair_state_initializes_block_pair_state",
          "relations.block_pair_output_reenters_next_pairformer_block"
        ],
        "outgoingRelationRefs": [
          "relations.block_pair_state_enters_outgoing_multiplication"
        ],
        "producerRefs": [
          "value_sites.pair_state_input",
          "value_sites.pair_after_transition"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_outgoing"
        ]
      },
      "pair_after_outgoing_multiplication": {
        "incomingRelationRefs": [
          "relations.outgoing_multiplication_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.outgoing_pair_state_enters_incoming_multiplication"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_outgoing"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_incoming"
        ]
      },
      "pair_after_incoming_multiplication": {
        "incomingRelationRefs": [
          "relations.incoming_multiplication_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.incoming_pair_state_enters_starting_attention"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_incoming"
        ],
        "consumerRefs": [
          "modules.pair_attention_starting_node"
        ]
      },
      "pair_after_starting_attention": {
        "incomingRelationRefs": [
          "relations.starting_attention_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.starting_pair_state_enters_ending_attention"
        ],
        "producerRefs": [
          "modules.pair_attention_starting_node"
        ],
        "consumerRefs": [
          "modules.pair_attention_ending_node"
        ]
      },
      "pair_after_ending_attention": {
        "incomingRelationRefs": [
          "relations.ending_attention_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.ending_pair_state_enters_pair_transition"
        ],
        "producerRefs": [
          "modules.pair_attention_ending_node"
        ],
        "consumerRefs": [
          "modules.pair_transition"
        ]
      },
      "pair_after_transition": {
        "incomingRelationRefs": [
          "relations.pair_transition_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.updated_pair_state_enters_bias_projection",
          "relations.block_pair_output_reenters_next_pairformer_block",
          "relations.final_pair_block_state_becomes_output"
        ],
        "producerRefs": [
          "modules.pair_transition"
        ],
        "consumerRefs": [
          "modules.single_pair_logits_projection",
          "value_sites.block_pair_state",
          "value_sites.pair_state_output"
        ]
      },
      "block_single_state": {
        "incomingRelationRefs": [
          "relations.input_single_state_initializes_block_single_state",
          "relations.block_single_output_reenters_next_pairformer_block"
        ],
        "outgoingRelationRefs": [
          "relations.block_single_state_enters_pair_biased_attention"
        ],
        "producerRefs": [
          "value_sites.single_state_input",
          "value_sites.single_after_transition"
        ],
        "consumerRefs": [
          "modules.single_attention_with_pair_bias"
        ]
      },
      "single_pair_attention_logits": {
        "incomingRelationRefs": [
          "relations.bias_projection_produces_pair_logits"
        ],
        "outgoingRelationRefs": [
          "relations.pair_logits_bias_single_attention"
        ],
        "producerRefs": [
          "modules.single_pair_logits_projection"
        ],
        "consumerRefs": [
          "modules.single_attention_with_pair_bias"
        ]
      },
      "single_after_pair_attention": {
        "incomingRelationRefs": [
          "relations.pair_biased_attention_updates_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.attention_updated_single_enters_transition"
        ],
        "producerRefs": [
          "modules.single_attention_with_pair_bias"
        ],
        "consumerRefs": [
          "modules.single_transition"
        ]
      },
      "single_after_transition": {
        "incomingRelationRefs": [
          "relations.single_transition_updates_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.block_single_output_reenters_next_pairformer_block",
          "relations.final_single_block_state_becomes_output"
        ],
        "producerRefs": [
          "modules.single_transition"
        ],
        "consumerRefs": [
          "value_sites.block_single_state",
          "value_sites.single_state_output"
        ]
      },
      "single_state_output": {
        "incomingRelationRefs": [
          "relations.final_single_block_state_becomes_output"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "value_sites.single_after_transition"
        ],
        "consumerRefs": [

        ]
      },
      "pair_state_output": {
        "incomingRelationRefs": [
          "relations.final_pair_block_state_becomes_output"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "value_sites.pair_after_transition"
        ],
        "consumerRefs": [

        ]
      },
      "msa_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.msa_input_enters_row_embedding"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.msa_row_embedding"
        ]
      },
      "has_deletion_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.has_deletion_enters_row_embedding"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.msa_row_embedding"
        ]
      },
      "deletion_value_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.deletion_value_enters_row_embedding"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.msa_row_embedding"
        ]
      },
      "msa_activations": {
        "incomingRelationRefs": [
          "relations.row_embedding_produces_msa_activations"
        ],
        "outgoingRelationRefs": [
          "relations.msa_activations_enters_outer_product_mean",
          "relations.msa_activations_enters_msa_pair_weighted_averaging"
        ],
        "producerRefs": [
          "modules.msa_row_embedding"
        ],
        "consumerRefs": [
          "modules.outer_product_mean",
          "modules.msa_pair_weighted_averaging"
        ]
      },
      "outer_product_mean_projection_a": {
        "incomingRelationRefs": [
          "relations.outer_product_mean_produces_projection_a"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.outer_product_mean"
        ],
        "consumerRefs": [

        ]
      },
      "outer_product_mean_projection_b": {
        "incomingRelationRefs": [
          "relations.outer_product_mean_produces_projection_b"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.outer_product_mean"
        ],
        "consumerRefs": [

        ]
      },
      "outer_product_mean_flattened": {
        "incomingRelationRefs": [
          "relations.outer_product_mean_produces_flattened_outer_product"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.outer_product_mean"
        ],
        "consumerRefs": [

        ]
      },
      "outer_product_mean_pair_contribution": {
        "incomingRelationRefs": [
          "relations.outer_product_mean_produces_pair_contribution"
        ],
        "outgoingRelationRefs": [
          "relations.outer_product_mean_contribution_updates_msa_module_pair_state"
        ],
        "producerRefs": [
          "modules.outer_product_mean"
        ],
        "consumerRefs": [
          "value_sites.msa_module_pair_state_read"
        ]
      },
      "msa_pair_weighted_averaging_value": {
        "incomingRelationRefs": [
          "relations.msa_pair_weighted_averaging_produces_value"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.msa_pair_weighted_averaging"
        ],
        "consumerRefs": [

        ]
      },
      "msa_pair_weighted_averaging_pair_bias": {
        "incomingRelationRefs": [
          "relations.msa_pair_weighted_averaging_produces_pair_bias"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.msa_pair_weighted_averaging"
        ],
        "consumerRefs": [

        ]
      },
      "msa_pair_weighted_averaging_gate": {
        "incomingRelationRefs": [
          "relations.msa_pair_weighted_averaging_produces_gate"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.msa_pair_weighted_averaging"
        ],
        "consumerRefs": [

        ]
      },
      "msa_pair_weighted_averaging_weights": {
        "incomingRelationRefs": [
          "relations.msa_pair_weighted_averaging_produces_attention_weights"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.msa_pair_weighted_averaging"
        ],
        "consumerRefs": [

        ]
      },
      "msa_module_pair_state_read": {
        "incomingRelationRefs": [
          "relations.z_init_initializes_msa_module_pair_state",
          "relations.outer_product_mean_contribution_updates_msa_module_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.pair_state_conditions_msa_pair_weighted_averaging",
          "relations.msa_pair_state_enters_outgoing_multiplication"
        ],
        "producerRefs": [
          "value_sites.z_init",
          "value_sites.outer_product_mean_pair_contribution"
        ],
        "consumerRefs": [
          "modules.msa_pair_weighted_averaging",
          "modules.msa_triangle_multiplication_outgoing"
        ]
      },
      "msa_activations_after_pair_weighted_averaging": {
        "incomingRelationRefs": [
          "relations.msa_pair_weighted_averaging_produces_updated_activations"
        ],
        "outgoingRelationRefs": [
          "relations.updated_activations_enter_transition"
        ],
        "producerRefs": [
          "modules.msa_pair_weighted_averaging"
        ],
        "consumerRefs": [
          "modules.msa_transition"
        ]
      },
      "msa_activations_after_transition": {
        "incomingRelationRefs": [
          "relations.transition_produces_final_activations"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.msa_transition"
        ],
        "consumerRefs": [

        ]
      },
      "msa_pair_after_outgoing_multiplication": {
        "incomingRelationRefs": [
          "relations.msa_outgoing_multiplication_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.msa_outgoing_pair_state_enters_incoming_multiplication"
        ],
        "producerRefs": [
          "modules.msa_triangle_multiplication_outgoing"
        ],
        "consumerRefs": [
          "modules.msa_triangle_multiplication_incoming"
        ]
      },
      "msa_pair_after_incoming_multiplication": {
        "incomingRelationRefs": [
          "relations.msa_incoming_multiplication_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.msa_incoming_pair_state_enters_starting_attention"
        ],
        "producerRefs": [
          "modules.msa_triangle_multiplication_incoming"
        ],
        "consumerRefs": [
          "modules.msa_pair_attention_starting_node"
        ]
      },
      "msa_pair_after_starting_attention": {
        "incomingRelationRefs": [
          "relations.msa_starting_attention_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.msa_starting_pair_state_enters_ending_attention"
        ],
        "producerRefs": [
          "modules.msa_pair_attention_starting_node"
        ],
        "consumerRefs": [
          "modules.msa_pair_attention_ending_node"
        ]
      },
      "msa_pair_after_ending_attention": {
        "incomingRelationRefs": [
          "relations.msa_ending_attention_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.msa_ending_pair_state_enters_pair_transition"
        ],
        "producerRefs": [
          "modules.msa_pair_attention_ending_node"
        ],
        "consumerRefs": [
          "modules.msa_pair_transition"
        ]
      },
      "msa_pair_after_transition": {
        "incomingRelationRefs": [
          "relations.msa_pair_transition_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.msa_module_pair_output_becomes_pair_state_input"
        ],
        "producerRefs": [
          "modules.msa_pair_transition"
        ],
        "consumerRefs": [
          "value_sites.pair_state_input"
        ]
      }
    },
    "execution": {
      "loops": [
        {
          "id": "pairformer_stack",
          "repeats": 48,
          "reruns": [
            "modules.triangle_multiplication_outgoing",
            "modules.triangle_multiplication_incoming",
            "modules.pair_attention_starting_node",
            "modules.pair_attention_ending_node",
            "modules.pair_transition",
            "modules.single_pair_logits_projection",
            "modules.single_attention_with_pair_bias",
            "modules.single_transition"
          ],
          "cached": [
            "value_sites.token_mask_input",
            "value_sites.pair_mask_input"
          ],
          "notes": [
            "Each block has an independent parameter set; this is a depth stack, not weight sharing across 48 iterations.",
            "The pair track is fully updated before that block's pair state conditions the single-track attention."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "af3_evoformer_code",
                "role": "configuration_evidence",
                "locator": "Evoformer.Config.pairformer and hk.experimental.layer_stack"
              },
              {
                "source_ref": "af3_pairformer_code",
                "role": "implementation_evidence",
                "locator": "PairFormerIteration.__call__"
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "pair_state": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      "single_state": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        }
      },
      "pair_attention_logits": {
        "representation_ref": "representations.pair_attention_logits",
        "value_site_refs": [
          "value_sites.single_pair_attention_logits"
        ],
        "lifecycle": "rebuilt_from_updated_pair_state_in_each_block",
        "notes": [
          "These 16-head logits bias single self-attention and are not a persistent state track."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "single_pair_logits_norm and single_pair_logits_projection"
            }
          ]
        }
      },
      "token_mask": {
        "representation_ref": "representations.token_mask",
        "value_site_refs": [
          "value_sites.token_mask_input"
        ],
        "lifecycle": "cached_read_only_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "seq_mask passed to PairFormerIteration"
            }
          ]
        }
      },
      "pair_mask": {
        "representation_ref": "representations.pair_mask",
        "value_site_refs": [
          "value_sites.pair_mask_input"
        ],
        "lifecycle": "cached_read_only_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pair_mask passed to PairFormerIteration"
            }
          ]
        }
      }
    },
    "stateSemanticsBySite": {
      "pair_state_input": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "block_pair_state": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_outgoing_multiplication": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_incoming_multiplication": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_starting_attention": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_ending_attention": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_transition": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_state_output": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "single_state_input": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "block_single_state": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "single_after_pair_attention": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "single_after_transition": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "single_state_output": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "single_pair_attention_logits": {
        "representation_ref": "representations.pair_attention_logits",
        "value_site_refs": [
          "value_sites.single_pair_attention_logits"
        ],
        "lifecycle": "rebuilt_from_updated_pair_state_in_each_block",
        "notes": [
          "These 16-head logits bias single self-attention and are not a persistent state track."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "single_pair_logits_norm and single_pair_logits_projection"
            }
          ]
        },
        "groupId": "pair_attention_logits"
      },
      "token_mask_input": {
        "representation_ref": "representations.token_mask",
        "value_site_refs": [
          "value_sites.token_mask_input"
        ],
        "lifecycle": "cached_read_only_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "seq_mask passed to PairFormerIteration"
            }
          ]
        },
        "groupId": "token_mask"
      },
      "pair_mask_input": {
        "representation_ref": "representations.pair_mask",
        "value_site_refs": [
          "value_sites.pair_mask_input"
        ],
        "lifecycle": "cached_read_only_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pair_mask passed to PairFormerIteration"
            }
          ]
        },
        "groupId": "pair_mask"
      }
    },
    "conditioning": [
      {
        "id": "outgoing_pair_mask",
        "relation_ref": "relations.pair_mask_conditions_outgoing_multiplication",
        "mode": "padding_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_mask_input",
        "target": "modules.triangle_multiplication_outgoing"
      },
      {
        "id": "incoming_pair_mask",
        "relation_ref": "relations.pair_mask_conditions_incoming_multiplication",
        "mode": "padding_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_mask_input",
        "target": "modules.triangle_multiplication_incoming"
      },
      {
        "id": "starting_attention_pair_mask",
        "relation_ref": "relations.pair_mask_conditions_starting_attention",
        "mode": "attention_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_mask_input",
        "target": "modules.pair_attention_starting_node"
      },
      {
        "id": "ending_attention_pair_mask",
        "relation_ref": "relations.pair_mask_conditions_ending_attention",
        "mode": "attention_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_mask_input",
        "target": "modules.pair_attention_ending_node"
      },
      {
        "id": "single_attention_token_mask",
        "relation_ref": "relations.token_mask_conditions_single_attention",
        "mode": "attention_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_self_attention_code",
              "role": "implementation_evidence",
              "locator": "self_attention mask bias"
            }
          ]
        },
        "source": "value_sites.token_mask_input",
        "target": "modules.single_attention_with_pair_bias"
      },
      {
        "id": "updated_pair_biases_single_attention",
        "relation_ref": "relations.pair_logits_bias_single_attention",
        "mode": "pair_logit_bias",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "single_pair_logits_projection and self_attention pair_logits argument"
            }
          ]
        },
        "source": "value_sites.single_pair_attention_logits",
        "target": "modules.single_attention_with_pair_bias"
      },
      {
        "id": "updated_pair_enters_bias_projection",
        "relation_ref": "relations.updated_pair_state_enters_bias_projection",
        "mode": "pair_logit_bias_source",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_after_transition",
        "target": "modules.single_pair_logits_projection"
      },
      {
        "id": "projected_pair_logits",
        "relation_ref": "relations.bias_projection_produces_pair_logits",
        "mode": "pair_logit_projection",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "modules.single_pair_logits_projection",
        "target": "value_sites.single_pair_attention_logits"
      }
    ],
    "scaleTransitions": [

    ],
    "trainingInference": {
      "objective": {
        "kind": "component_only",
        "notes": [
          "The Pairformer is trained as part of the complete AlphaFold 3 system; this bounded diagram does not assign it a standalone loss."
        ]
      },
      "schedule": {
        "kind": "none"
      },
      "sampler": {
        "kind": "none"
      },
      "teacher_forcing": "not_applicable",
      "self_conditioning": "none",
      "checkpoint_notes": [
        "The released implementation applies the same deterministic Pairformer computation in training and inference; upstream recycling is outside this diagram."
      ],
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "af3_evoformer_code",
            "role": "implementation_evidence",
            "locator": "Evoformer.__call__ pairformer_stack"
          }
        ]
      }
    },
    "relations": [
      {
        "id": "input_pair_state_initializes_block_pair_state",
        "from": "value_sites.pair_state_input",
        "to": "value_sites.block_pair_state",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "initialize_pairformer_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "input_single_state_initializes_block_single_state",
        "from": "value_sites.single_state_input",
        "to": "value_sites.block_single_state",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "initialize_pairformer_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_pair_state_enters_outgoing_multiplication",
        "from": "value_sites.block_pair_state",
        "to": "modules.triangle_multiplication_outgoing",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_outgoing_triangle_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_conditions_outgoing_multiplication",
        "from": "value_sites.pair_mask_input",
        "to": "modules.triangle_multiplication_outgoing",
        "kind": "conditioning",
        "carries": [
          "representations.pair_mask"
        ],
        "operation": "mask_outgoing_triangle_inputs",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "outgoing_multiplication_updates_pair_state",
        "from": "modules.triangle_multiplication_outgoing",
        "to": "value_sites.pair_after_outgoing_multiplication",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_outgoing_triangle_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "outgoing_pair_state_enters_incoming_multiplication",
        "from": "value_sites.pair_after_outgoing_multiplication",
        "to": "modules.triangle_multiplication_incoming",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_incoming_triangle_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_conditions_incoming_multiplication",
        "from": "value_sites.pair_mask_input",
        "to": "modules.triangle_multiplication_incoming",
        "kind": "conditioning",
        "carries": [
          "representations.pair_mask"
        ],
        "operation": "mask_incoming_triangle_inputs",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "incoming_multiplication_updates_pair_state",
        "from": "modules.triangle_multiplication_incoming",
        "to": "value_sites.pair_after_incoming_multiplication",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_incoming_triangle_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "incoming_pair_state_enters_starting_attention",
        "from": "value_sites.pair_after_incoming_multiplication",
        "to": "modules.pair_attention_starting_node",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "attend_along_starting_node_axis",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_conditions_starting_attention",
        "from": "value_sites.pair_mask_input",
        "to": "modules.pair_attention_starting_node",
        "kind": "conditioning",
        "carries": [
          "representations.pair_mask"
        ],
        "operation": "mask_starting_node_attention",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "starting_attention_updates_pair_state",
        "from": "modules.pair_attention_starting_node",
        "to": "value_sites.pair_after_starting_attention",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_starting_node_attention_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "starting_pair_state_enters_ending_attention",
        "from": "value_sites.pair_after_starting_attention",
        "to": "modules.pair_attention_ending_node",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "attend_along_ending_node_axis",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_conditions_ending_attention",
        "from": "value_sites.pair_mask_input",
        "to": "modules.pair_attention_ending_node",
        "kind": "conditioning",
        "carries": [
          "representations.pair_mask"
        ],
        "operation": "mask_ending_node_attention",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "ending_attention_updates_pair_state",
        "from": "modules.pair_attention_ending_node",
        "to": "value_sites.pair_after_ending_attention",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_ending_node_attention_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "ending_pair_state_enters_pair_transition",
        "from": "value_sites.pair_after_ending_attention",
        "to": "modules.pair_transition",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_pair_transition_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_transition_updates_pair_state",
        "from": "modules.pair_transition",
        "to": "value_sites.pair_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_pair_transition_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "updated_pair_state_enters_bias_projection",
        "from": "value_sites.pair_after_transition",
        "to": "modules.single_pair_logits_projection",
        "kind": "conditioning",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "normalize_and_project_pair_logits",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "bias_projection_produces_pair_logits",
        "from": "modules.single_pair_logits_projection",
        "to": "value_sites.single_pair_attention_logits",
        "kind": "conditioning",
        "carries": [
          "representations.pair_attention_logits"
        ],
        "operation": "project_sixteen_attention_logits",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_single_state_enters_pair_biased_attention",
        "from": "value_sites.block_single_state",
        "to": "modules.single_attention_with_pair_bias",
        "kind": "data_flow",
        "carries": [
          "representations.single_state"
        ],
        "operation": "project_single_queries_keys_values",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_logits_bias_single_attention",
        "from": "value_sites.single_pair_attention_logits",
        "to": "modules.single_attention_with_pair_bias",
        "kind": "conditioning",
        "carries": [
          "representations.pair_attention_logits"
        ],
        "operation": "add_pair_logits_to_attention_scores",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "token_mask_conditions_single_attention",
        "from": "value_sites.token_mask_input",
        "to": "modules.single_attention_with_pair_bias",
        "kind": "conditioning",
        "carries": [
          "representations.token_mask"
        ],
        "operation": "mask_invalid_attention_keys",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_biased_attention_updates_single_state",
        "from": "modules.single_attention_with_pair_bias",
        "to": "value_sites.single_after_pair_attention",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "add_single_attention_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "attention_updated_single_enters_transition",
        "from": "value_sites.single_after_pair_attention",
        "to": "modules.single_transition",
        "kind": "data_flow",
        "carries": [
          "representations.single_state"
        ],
        "operation": "compute_single_transition_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_transition_updates_single_state",
        "from": "modules.single_transition",
        "to": "value_sites.single_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "add_single_transition_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_pair_output_reenters_next_pairformer_block",
        "from": "value_sites.pair_after_transition",
        "to": "value_sites.block_pair_state",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "advance_pair_state_to_next_block",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_single_output_reenters_next_pairformer_block",
        "from": "value_sites.single_after_transition",
        "to": "value_sites.block_single_state",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "advance_single_state_to_next_block",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "final_pair_block_state_becomes_output",
        "from": "value_sites.pair_after_transition",
        "to": "value_sites.pair_state_output",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "expose_final_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "final_single_block_state_becomes_output",
        "from": "value_sites.single_after_transition",
        "to": "value_sites.single_state_output",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "expose_final_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "atom_reference_features_enter_atom_attention_encoder",
        "from": "value_sites.atom_reference_features_input",
        "to": "modules.atom_attention_encoder_bare",
        "kind": "data_flow",
        "carries": [
          "representations.atom_reference_features"
        ],
        "operation": "encode_isolated_reference_conformer_geometry",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 1"
            }
          ]
        }
      },
      {
        "id": "atom_attention_encoder_feeds_concatenation",
        "from": "modules.atom_attention_encoder_bare",
        "to": "modules.input_feature_concatenation",
        "kind": "data_flow",
        "carries": [
          "representations.pooled_atom_encoding"
        ],
        "operation": "pool_atom_encoding_for_concatenation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 lines 1-2 (a_i, discarding the encoder's skip-connection outputs, then concat(a_i, ...))"
            }
          ]
        }
      },
      {
        "id": "restype_enters_concatenation",
        "from": "value_sites.restype_input",
        "to": "modules.input_feature_concatenation",
        "kind": "data_flow",
        "carries": [
          "representations.restype"
        ],
        "operation": "provide_restype_for_concatenation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2"
            }
          ]
        }
      },
      {
        "id": "profile_enters_concatenation",
        "from": "value_sites.profile_input",
        "to": "modules.input_feature_concatenation",
        "kind": "data_flow",
        "carries": [
          "representations.profile"
        ],
        "operation": "provide_profile_for_concatenation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2"
            }
          ]
        }
      },
      {
        "id": "deletion_mean_enters_concatenation",
        "from": "value_sites.deletion_mean_input",
        "to": "modules.input_feature_concatenation",
        "kind": "data_flow",
        "carries": [
          "representations.deletion_mean"
        ],
        "operation": "provide_deletion_mean_for_concatenation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2"
            }
          ]
        }
      },
      {
        "id": "concatenation_produces_s_inputs",
        "from": "modules.input_feature_concatenation",
        "to": "value_sites.s_inputs",
        "kind": "state_update",
        "carries": [
          "representations.s_inputs"
        ],
        "operation": "concat_pooled_atom_encoding_and_per_token_features",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 2 line 2 (s_i = concat(a_i, f_i^restype, f_i^profile, f_i^deletion_mean))"
            }
          ]
        }
      },
      {
        "id": "s_inputs_enters_single_state_projection",
        "from": "value_sites.s_inputs",
        "to": "modules.single_state_input_projection",
        "kind": "data_flow",
        "carries": [
          "representations.s_inputs"
        ],
        "operation": "read_s_inputs_for_single_projection",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 1 line 2"
            }
          ]
        }
      },
      {
        "id": "single_state_projection_produces_single_state_input",
        "from": "modules.single_state_input_projection",
        "to": "value_sites.single_state_input",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "project_s_inputs_to_single_state_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 1 line 2 (s_init = LinearNoBias(s_inputs))"
            }
          ]
        }
      },
      {
        "id": "s_inputs_enters_pair_state_projection",
        "from": "value_sites.s_inputs",
        "to": "modules.pair_state_input_projection",
        "kind": "data_flow",
        "carries": [
          "representations.s_inputs"
        ],
        "operation": "read_s_inputs_for_pair_projection",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 1 line 3"
            }
          ]
        }
      },
      {
        "id": "pair_state_projection_produces_z_init",
        "from": "modules.pair_state_input_projection",
        "to": "value_sites.z_init",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "outer_sum_project_s_inputs_to_z_init",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 1 line 3 (z_init_ij = LinearNoBias(s_i^inputs) + LinearNoBias(s_j^inputs); lines 4-5's RelativePositionEncoding and token_bonds contributions to z_init are separate inputs not modeled by this relation). Retargeted from producing value_sites.pair_state_input directly (module 1's original wiring, when nothing sat between the projection and the Pairformer's own input) to producing value_sites.z_init, now that value_sites.z_init -> modules.msa_module -> value_sites.pair_state_input is the real chain (Algorithm 1 line 10; Algorithm 8)."
            }
          ]
        }
      },
      {
        "id": "msa_input_enters_row_embedding",
        "from": "value_sites.msa_input",
        "to": "modules.msa_row_embedding",
        "kind": "data_flow",
        "carries": [
          "representations.msa_identity"
        ],
        "operation": "provide_raw_msa_identity_for_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 1"
            }
          ]
        }
      },
      {
        "id": "has_deletion_enters_row_embedding",
        "from": "value_sites.has_deletion_input",
        "to": "modules.msa_row_embedding",
        "kind": "data_flow",
        "carries": [
          "representations.has_deletion"
        ],
        "operation": "provide_deletion_flag_for_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 1"
            }
          ]
        }
      },
      {
        "id": "deletion_value_enters_row_embedding",
        "from": "value_sites.deletion_value_input",
        "to": "modules.msa_row_embedding",
        "kind": "data_flow",
        "carries": [
          "representations.deletion_value"
        ],
        "operation": "provide_deletion_value_for_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 1"
            }
          ]
        }
      },
      {
        "id": "row_embedding_produces_msa_activations",
        "from": "modules.msa_row_embedding",
        "to": "value_sites.msa_activations",
        "kind": "state_update",
        "carries": [
          "representations.msa_activations"
        ],
        "operation": "concat_embed_and_add_s_inputs_to_every_msa_row",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 1, 3-4"
            }
          ]
        }
      },
      {
        "id": "msa_activations_enters_outer_product_mean",
        "from": "value_sites.msa_activations",
        "to": "modules.outer_product_mean",
        "kind": "data_flow",
        "carries": [
          "representations.msa_activations"
        ],
        "operation": "read_msa_activations_for_communication",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 6 ({z_ij} += OuterProductMean({m_si}))"
            }
          ]
        }
      },
      {
        "id": "msa_activations_enters_msa_pair_weighted_averaging",
        "from": "value_sites.msa_activations",
        "to": "modules.msa_pair_weighted_averaging",
        "kind": "data_flow",
        "carries": [
          "representations.msa_activations"
        ],
        "operation": "read_msa_activations_for_msa_stack",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 7 (MSAPairWeightedAveraging({m_si}, {z_ij}, c=8))"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_produces_projection_a",
        "from": "modules.outer_product_mean",
        "to": "value_sites.outer_product_mean_projection_a",
        "kind": "data_flow",
        "carries": [
          "representations.outer_product_mean_projection_a"
        ],
        "operation": "project_msa_activations_to_left_factor",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 lines 1-2"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_produces_projection_b",
        "from": "modules.outer_product_mean",
        "to": "value_sites.outer_product_mean_projection_b",
        "kind": "data_flow",
        "carries": [
          "representations.outer_product_mean_projection_b"
        ],
        "operation": "project_msa_activations_to_right_factor",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 lines 1-2"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_produces_flattened_outer_product",
        "from": "modules.outer_product_mean",
        "to": "value_sites.outer_product_mean_flattened",
        "kind": "data_flow",
        "carries": [
          "representations.outer_product_mean_flattened"
        ],
        "operation": "form_and_average_outer_product_across_msa_rows",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 line 3"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_produces_pair_contribution",
        "from": "modules.outer_product_mean",
        "to": "value_sites.outer_product_mean_pair_contribution",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compress_flattened_outer_product_to_pair_channels",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 9 line 4 (z_ij = Linear(o_ij)); Algorithm 8 line 6 ({z_ij} += OuterProductMean({m_si})) -- this contribution's own += into the pair representation is relations.outer_product_mean_contribution_updates_msa_module_pair_state"
            }
          ]
        }
      },
      {
        "id": "pair_state_conditions_msa_pair_weighted_averaging",
        "from": "value_sites.msa_module_pair_state_read",
        "to": "modules.msa_pair_weighted_averaging",
        "kind": "conditioning",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "condition_attention_weights_on_pair_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 lines 3, 5; Algorithm 8 line 7"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_produces_value",
        "from": "modules.msa_pair_weighted_averaging",
        "to": "value_sites.msa_pair_weighted_averaging_value",
        "kind": "data_flow",
        "carries": [
          "representations.msa_pair_weighted_averaging_value"
        ],
        "operation": "project_msa_activations_to_per_head_value",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 lines 1-2"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_produces_pair_bias",
        "from": "modules.msa_pair_weighted_averaging",
        "to": "value_sites.msa_pair_weighted_averaging_pair_bias",
        "kind": "data_flow",
        "carries": [
          "representations.msa_pair_weighted_averaging_pair_bias"
        ],
        "operation": "project_pair_representation_to_per_head_bias",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 3"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_produces_gate",
        "from": "modules.msa_pair_weighted_averaging",
        "to": "value_sites.msa_pair_weighted_averaging_gate",
        "kind": "data_flow",
        "carries": [
          "representations.msa_pair_weighted_averaging_gate"
        ],
        "operation": "project_msa_activations_to_per_head_gate",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 4"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_produces_attention_weights",
        "from": "modules.msa_pair_weighted_averaging",
        "to": "value_sites.msa_pair_weighted_averaging_weights",
        "kind": "data_flow",
        "carries": [
          "representations.msa_pair_weighted_averaging_weights"
        ],
        "operation": "softmax_normalize_pair_bias_over_key_axis",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 line 5"
            }
          ]
        }
      },
      {
        "id": "msa_pair_weighted_averaging_produces_updated_activations",
        "from": "modules.msa_pair_weighted_averaging",
        "to": "value_sites.msa_activations_after_pair_weighted_averaging",
        "kind": "state_update",
        "carries": [
          "representations.msa_activations"
        ],
        "operation": "gate_weighted_average_project_and_add_to_msa_activations",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 10 lines 6-7; Algorithm 8 line 7 ({m_si} += DropoutRowwise_0.15(MSAPairWeightedAveraging(...)))"
            }
          ]
        }
      },
      {
        "id": "updated_activations_enter_transition",
        "from": "value_sites.msa_activations_after_pair_weighted_averaging",
        "to": "modules.msa_transition",
        "kind": "data_flow",
        "carries": [
          "representations.msa_activations"
        ],
        "operation": "read_msa_activations_for_transition",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 8"
            }
          ]
        }
      },
      {
        "id": "transition_produces_final_activations",
        "from": "modules.msa_transition",
        "to": "value_sites.msa_activations_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.msa_activations"
        ],
        "operation": "apply_swiglu_transition_and_add_to_msa_activations",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 8 ({m_si} += Transition({m_si})); Algorithm 11 (Transition)"
            }
          ]
        }
      },
      {
        "id": "s_inputs_enters_msa_row_embedding",
        "from": "value_sites.s_inputs",
        "to": "modules.msa_row_embedding",
        "kind": "data_flow",
        "carries": [
          "representations.s_inputs"
        ],
        "operation": "read_s_inputs_for_msa_row_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 4 (m_si += LinearNoBias(s_i^inputs)) -- s_inputs is added into every MSA row identically"
            }
          ]
        }
      },
      {
        "id": "z_init_initializes_msa_module_pair_state",
        "from": "value_sites.z_init",
        "to": "value_sites.msa_module_pair_state_read",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "initialize_msa_module_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 signature ({z_ij} passed into MsaModule as its second argument); Algorithm 1 line 10 ({z_ij} += MsaModule({f_Si^msa}, {z_ij}, {s_i^inputs})) -- the module's own entry state, mirroring input_pair_state_initializes_block_pair_state's role for the Pairformer"
            }
          ]
        }
      },
      {
        "id": "outer_product_mean_contribution_updates_msa_module_pair_state",
        "from": "value_sites.outer_product_mean_pair_contribution",
        "to": "value_sites.msa_module_pair_state_read",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_outer_product_mean_contribution_to_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 6 ({z_ij} += OuterProductMean({m_si})) -- communication writes into z_ij before the MSA stack (line 7) or this block's pair-stack (lines 9-13) run"
            }
          ]
        }
      },
      {
        "id": "msa_pair_state_enters_outgoing_multiplication",
        "from": "value_sites.msa_module_pair_state_read",
        "to": "modules.msa_triangle_multiplication_outgoing",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_msa_module_outgoing_triangle_delta",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_outgoing_multiplication_updates_pair_state",
        "from": "modules.msa_triangle_multiplication_outgoing",
        "to": "value_sites.msa_pair_after_outgoing_multiplication",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_msa_module_outgoing_triangle_delta",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_outgoing_pair_state_enters_incoming_multiplication",
        "from": "value_sites.msa_pair_after_outgoing_multiplication",
        "to": "modules.msa_triangle_multiplication_incoming",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_msa_module_incoming_triangle_delta",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_incoming_multiplication_updates_pair_state",
        "from": "modules.msa_triangle_multiplication_incoming",
        "to": "value_sites.msa_pair_after_incoming_multiplication",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_msa_module_incoming_triangle_delta",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_incoming_pair_state_enters_starting_attention",
        "from": "value_sites.msa_pair_after_incoming_multiplication",
        "to": "modules.msa_pair_attention_starting_node",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "attend_msa_module_starting_node_axis",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_starting_attention_updates_pair_state",
        "from": "modules.msa_pair_attention_starting_node",
        "to": "value_sites.msa_pair_after_starting_attention",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_msa_module_starting_node_attention_delta",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_starting_pair_state_enters_ending_attention",
        "from": "value_sites.msa_pair_after_starting_attention",
        "to": "modules.msa_pair_attention_ending_node",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "attend_msa_module_ending_node_axis",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_ending_attention_updates_pair_state",
        "from": "modules.msa_pair_attention_ending_node",
        "to": "value_sites.msa_pair_after_ending_attention",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_msa_module_ending_node_attention_delta",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_ending_pair_state_enters_pair_transition",
        "from": "value_sites.msa_pair_after_ending_attention",
        "to": "modules.msa_pair_transition",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_msa_module_pair_transition_delta",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_pair_transition_updates_pair_state",
        "from": "modules.msa_pair_transition",
        "to": "value_sites.msa_pair_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_msa_module_pair_transition_delta",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 lines 9-13 -- the pair-stack reads the same z_ij that communication (line 6) just wrote into and MSAPairWeightedAveraging (line 7) read, since lines 7-8 update only {m_si}"
            }
          ]
        }
      },
      {
        "id": "msa_module_pair_output_becomes_pair_state_input",
        "from": "value_sites.msa_pair_after_transition",
        "to": "value_sites.pair_state_input",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "expose_msa_module_final_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 15 (#kw[return] {z_ij}) -- only z_ij is returned, the MSA representation is discarded; this is the module's actual contribution to the architecture's persistent pair_state_input, per Algorithm 1 line 10 ({z_ij} += MsaModule(...)) feeding the 48-block PairformerStack call on line 12"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "pairformer_has_no_msa_state",
        "statement": "The Pairformer boundary retains only pair and single token representations; MSA processing occurs earlier in the AF3 trunk.",
        "scope": {
          "module_ref": "modules.pairformer_stack"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Network architecture and training; Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_track_precedes_single_track",
        "statement": "Within each block, all five pair updates finish before the updated pair state is projected into logits for single self-attention.",
        "scope": {
          "module_ref": "modules.pairformer_stack"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_state_does_not_receive_single_update",
        "statement": "The released AF3 Pairformer iteration updates single state from pair-derived attention logits but does not inject the updated single state back into pair state within that block.",
        "scope": {
          "module_ref": "modules.pairformer_stack"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "blocks_have_independent_weights",
        "statement": "The 48 Pairformer blocks have independent trainable parameters rather than sharing one block's weights.",
        "scope": {
          "module_ref": "modules.pairformer_stack"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a caption"
            }
          ]
        }
      }
    ],
    "openQuestions": [
      {
        "id": "relative_position_encoding_and_token_bonds_unmodeled",
        "question": "Algorithm 1 lines 4-5 add RelativePositionEncoding(f*) and a LinearNoBias(token_bonds) embedding into z_init, on top of the outer-sum projection of s_inputs (line 3). Only the s_inputs contribution is modeled by pair_state_projection_produces_z_init; RelativePositionEncoding and the token_bonds embedding are real, additional contributors to z_init that are not yet represented as their own value sites, modules, or relations.",
        "status": "deferred",
        "affected_refs": [
          "value_sites.z_init",
          "relations.pair_state_projection_produces_z_init",
          "modules.pair_state_input_projection"
        ],
        "resolution_criteria": "Model RelativePositionEncoding (Algorithm 3) and the token_bonds embedding as their own boundary:input value sites and relations feeding z_init, alongside the existing s_inputs outer-sum contribution.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 1 lines 4-5"
            }
          ]
        }
      },
      {
        "id": "msa_row_resampling_unmodeled",
        "question": "Algorithm 8 line 2 (SampleRandomWithoutReplacement) draws a random subset of MSA rows fresh at every recycle before line 3's embedding. This resampling step is not modeled as its own value site, module, or relation; value_sites.msa_activations treats N_msa as the working (already-sampled) row count without a separate value site distinguishing the full alignment depth from the per-recycle sampled subset.",
        "status": "deferred",
        "affected_refs": [
          "value_sites.msa_activations",
          "modules.msa_row_embedding"
        ],
        "resolution_criteria": "Model the resampling step explicitly (likely alongside the outer per-recycle loop, Algorithm 1, which this source set does not yet model at all) if/when that recycling structure is added to this architecture.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Supplementary Algorithm 8 line 2"
            }
          ]
        }
      }
    ]
  },
  "bibliography": {
    "schemaVersion": "bibliography-v0.1",
    "sourceYaml": "../../references/bibliography.yaml",
    "sources": [
      {
        "id": "dit_2022",
        "kind": "paper",
        "title": "Scalable Diffusion Models with Transformers",
        "authors": [
          "William Peebles",
          "Saining Xie"
        ],
        "year": 2022,
        "identifiers": {
          "arxiv": "2212.09748"
        },
        "url": "https://arxiv.org/abs/2212.09748",
        "href": "https://arxiv.org/abs/2212.09748"
      },
      {
        "id": "dit_models_code",
        "kind": "code",
        "title": "DiT model implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/models.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py"
      },
      {
        "id": "dit_sample_code",
        "kind": "code",
        "title": "DiT sampling entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/sample.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py"
      },
      {
        "id": "dit_gaussian_diffusion_code",
        "kind": "code",
        "title": "DiT Gaussian diffusion implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/diffusion/gaussian_diffusion.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py"
      },
      {
        "id": "dit_train_code",
        "kind": "code",
        "title": "DiT training entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/train.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py"
      },
      {
        "id": "af2_2021",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2"
        },
        "url": "https://www.nature.com/articles/s41586-021-03819-2",
        "href": "https://www.nature.com/articles/s41586-021-03819-2"
      },
      {
        "id": "af2_2021_supplement",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold: Supplementary Information",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2",
          "component": "supplementary_information"
        },
        "url": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf",
        "href": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf"
      },
      {
        "id": "af2_runner_code",
        "kind": "code",
        "title": "AlphaFold prediction and ranking entry point",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "run_alphafold.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py"
      },
      {
        "id": "af2_data_pipeline_code",
        "kind": "code",
        "title": "AlphaFold monomer input feature pipeline",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/data/pipeline.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py"
      },
      {
        "id": "af2_model_wrapper_code",
        "kind": "code",
        "title": "AlphaFold model runner and monomer selection wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/model.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py"
      },
      {
        "id": "af2_model_code",
        "kind": "code",
        "title": "AlphaFold monomer model and recycling implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/modules.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py"
      },
      {
        "id": "af2_structure_code",
        "kind": "code",
        "title": "AlphaFold monomer structure module",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/folding.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py"
      },
      {
        "id": "af2_config_code",
        "kind": "code",
        "title": "AlphaFold model configuration",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/config.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py"
      },
      {
        "id": "af2_relax_code",
        "kind": "code",
        "title": "AlphaFold Amber relaxation wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/relax/relax.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py"
      },
      {
        "id": "af3_2024",
        "kind": "paper",
        "title": "Accurate structure prediction of biomolecular interactions with AlphaFold 3",
        "authors": [
          "Josh Abramson",
          "Jonas Adler",
          "Jack Dunger",
          "Richard Evans",
          "Tim Green",
          "Alexander Pritzel",
          "Olaf Ronneberger",
          "Lindsay Willmore",
          "Andrew J. Ballard",
          "Joshua Bambrick",
          "Sebastian W. Bodenstein",
          "David A. Evans",
          "Chia-Chun Hung",
          "Michael O'Neill",
          "David Reiman",
          "Kathryn Tunyasuvunakool",
          "Zachary Wu",
          "Akvile Zemgulyte",
          "Victor Bapst",
          "Pushmeet Kohli",
          "Max Jaderberg",
          "Demis Hassabis",
          "John M. Jumper"
        ],
        "year": 2024,
        "identifiers": {
          "doi": "10.1038/s41586-024-07487-w"
        },
        "url": "https://www.nature.com/articles/s41586-024-07487-w",
        "href": "https://www.nature.com/articles/s41586-024-07487-w"
      },
      {
        "id": "af3_pairformer_code",
        "kind": "code",
        "title": "AlphaFold 3 Pairformer iteration and pair-update implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold3",
        "revision": "f3e86f27dfac16559d16f470bb2f9323eb357f1f",
        "path": "src/alphafold3/model/network/modules.py",
        "url": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/modules.py",
        "href": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/modules.py"
      },
      {
        "id": "af3_evoformer_code",
        "kind": "code",
        "title": "AlphaFold 3 trunk and Pairformer stack configuration",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold3",
        "revision": "f3e86f27dfac16559d16f470bb2f9323eb357f1f",
        "path": "src/alphafold3/model/network/evoformer.py",
        "url": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/evoformer.py",
        "href": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/evoformer.py"
      },
      {
        "id": "af3_self_attention_code",
        "kind": "code",
        "title": "AlphaFold 3 single self-attention implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold3",
        "revision": "f3e86f27dfac16559d16f470bb2f9323eb357f1f",
        "path": "src/alphafold3/model/network/diffusion_transformer.py",
        "url": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/diffusion_transformer.py",
        "href": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/diffusion_transformer.py"
      },
      {
        "id": "genie2_2024",
        "kind": "paper",
        "title": "Out of Many, One: Designing and Scaffolding Proteins at the Scale of the Structural Universe with Genie 2",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Zhao Zhang",
          "Mohammed AlQuraishi"
        ],
        "year": 2024,
        "identifiers": {
          "arxiv": "2405.15489"
        },
        "url": "https://arxiv.org/abs/2405.15489",
        "href": "https://arxiv.org/abs/2405.15489"
      },
      {
        "id": "genie2_model_code",
        "kind": "code",
        "title": "Genie 2 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/model.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py"
      },
      {
        "id": "genie2_single_feature_code",
        "kind": "code",
        "title": "Genie 2 single-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/single_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py"
      },
      {
        "id": "genie2_pair_feature_code",
        "kind": "code",
        "title": "Genie 2 pair-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py"
      },
      {
        "id": "genie2_pair_transform_code",
        "kind": "code",
        "title": "Genie 2 pair-transform network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_transform_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py"
      },
      {
        "id": "genie2_structure_code",
        "kind": "code",
        "title": "Genie 2 equivariant structure network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py"
      },
      {
        "id": "genie2_ipa_code",
        "kind": "code",
        "title": "Genie 2 invariant point attention module",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/modules/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py"
      },
      {
        "id": "genie2_sampler_code",
        "kind": "code",
        "title": "Genie 2 reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/base.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py"
      },
      {
        "id": "genie2_scaffold_sampler_code",
        "kind": "code",
        "title": "Genie 2 motif-scaffolding sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/scaffold.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py"
      },
      {
        "id": "genie2_training_code",
        "kind": "code",
        "title": "Genie 2 diffusion training step",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/diffusion/genie.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py"
      },
      {
        "id": "genie2_config_code",
        "kind": "code",
        "title": "Genie 2 model and diffusion configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/config.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py"
      },
      {
        "id": "genie2_base_config",
        "kind": "code",
        "title": "Genie 2 released base-checkpoint configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "results/base/configuration",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration"
      },
      {
        "id": "genie3_2026",
        "kind": "paper",
        "title": "Fast and Ultra-Capable Protein Design: Advancing the Frontier Through Atomistic SE(3)-Equivariance with Genie 3",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Siddharth Vermani",
          "Yuwei Jiang",
          "Robbe De Cooman",
          "Bryan Spetko",
          "Mohammed AlQuraishi"
        ],
        "year": 2026,
        "identifiers": {
          "doi": "10.64898/2026.05.01.722168"
        },
        "url": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1",
        "href": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1"
      },
      {
        "id": "genie3_model_code",
        "kind": "code",
        "title": "Genie 3 V1 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/implementation/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py"
      },
      {
        "id": "genie3_single_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 single-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/single/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py"
      },
      {
        "id": "genie3_pair_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 pair-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/pair/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py"
      },
      {
        "id": "genie3_latent_transformer_code",
        "kind": "code",
        "title": "Genie 3 latent transformer",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/latent/transformer.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py"
      },
      {
        "id": "genie3_structure_code",
        "kind": "code",
        "title": "Genie 3 equivariant structure decoder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py"
      },
      {
        "id": "genie3_ipa_code",
        "kind": "code",
        "title": "Genie 3 full and reduced invariant point attention modules",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/module/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py"
      },
      {
        "id": "genie3_transition_code",
        "kind": "code",
        "title": "Genie 3 transition modules",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/module/transition.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/transition.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/transition.py"
      },
      {
        "id": "genie3_sequence_code",
        "kind": "code",
        "title": "Genie 3 optional sequence head",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/sequence_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py"
      },
      {
        "id": "genie3_geometry_code",
        "kind": "code",
        "title": "Genie 3 Frenet frame construction",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/geo_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py"
      },
      {
        "id": "genie3_feature_code",
        "kind": "code",
        "title": "Genie 3 protein tokenization and conditioning features",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/feat_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py"
      },
      {
        "id": "genie3_feature_schema_code",
        "kind": "code",
        "title": "Genie 3 feature dictionary registry",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/np/features.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py"
      },
      {
        "id": "genie3_sample_dataset_registry_code",
        "kind": "code",
        "title": "Genie 3 generation task-source router",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/data/sample_dataset/registry.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py"
      },
      {
        "id": "genie3_diffusion_code",
        "kind": "code",
        "title": "Genie 3 DDPM training objective",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/ddpm.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py"
      },
      {
        "id": "genie3_sampler_code",
        "kind": "code",
        "title": "Genie 3 base reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/sampler.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py"
      },
      {
        "id": "genie3_ddim_code",
        "kind": "code",
        "title": "Genie 3 DDIM directional-scaling sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/ddim.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py"
      },
      {
        "id": "genie3_config_code",
        "kind": "code",
        "title": "Genie 3 V1 architecture configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/config/model/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py"
      },
      {
        "id": "genie3_export_code",
        "kind": "code",
        "title": "Genie 3 generated-structure postprocessing",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/runner/postprocess.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py"
      },
      {
        "id": "generic_feature_refinement_source",
        "kind": "source",
        "title": "Generic Feature Refinement architecture source",
        "path": "architectures/generic-feature-refinement.yaml",
        "href": "../../architectures/generic-feature-refinement.yaml"
      },
      {
        "id": "architecture_language_protocol",
        "kind": "protocol",
        "title": "Architecture language protocol",
        "path": "protocol/architecture-language.md",
        "href": "../../protocol/architecture-language.md"
      }
    ]
  },
  "standardBlocks": {
  },
  "pseudocode": {
    "alphafold3_pairformer": {
      "schemaVersion": "pseudocode-v0.2",
      "compilerVersion": "semantic-pseudocode-compiler-v0.3",
      "id": "alphafold3_pairformer",
      "title": "AlphaFold 3 Pairformer Trace",
      "rootScope": "scopes.pairformer",
      "sources": [
        {
          "id": "pairformer_code",
          "source_ref": "af3_pairformer_code"
        },
        {
          "id": "evoformer_code",
          "source_ref": "af3_evoformer_code"
        },
        {
          "id": "single_attention_code",
          "source_ref": "af3_self_attention_code"
        }
      ],
      "scopes": [
        {
          "id": "pairformer",
          "ref": "scopes.pairformer",
          "label": "AlphaFold 3 Pairformer",
          "kind": "program",
          "parentRef": "pseudocode",
          "subjectRef": "architecture"
        },
        {
          "id": "stack",
          "ref": "scopes.stack",
          "label": "48-block Pairformer stack",
          "kind": "loop",
          "parentRef": "scopes.pairformer",
          "subjectRef": "modules.pairformer_stack",
          "executionRef": "execution.loops.pairformer_stack"
        },
        {
          "id": "pair_update",
          "ref": "scopes.pair_update",
          "label": "Pair-track update",
          "kind": "module",
          "parentRef": "scopes.stack",
          "subjectRef": "modules.pair_update_stage"
        },
        {
          "id": "single_update",
          "ref": "scopes.single_update",
          "label": "Single-track update",
          "kind": "module",
          "parentRef": "scopes.stack",
          "subjectRef": "modules.single_update_stage"
        }
      ],
      "symbols": [
        {
          "id": "input_single",
          "name": "s",
          "tex": "s",
          "type": "input",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.single_state_input"
        },
        {
          "id": "input_pair",
          "name": "z",
          "tex": "z",
          "type": "input",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.pair_state_input"
        },
        {
          "id": "input_token_mask",
          "name": "token_mask",
          "type": "mask",
          "shape": "N_token",
          "representationRef": "representations.token_mask",
          "scale": "token",
          "glyph": "vector",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.token_mask_input"
        },
        {
          "id": "input_pair_mask",
          "name": "pair_mask",
          "type": "mask",
          "shape": "N_token x N_token",
          "representationRef": "representations.pair_mask",
          "scale": "token_pair",
          "glyph": "matrix",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.pair_mask_input"
        },
        {
          "id": "output_single",
          "name": "s_trunk",
          "tex": "s^{trunk}",
          "type": "output",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.single_state_output"
        },
        {
          "id": "output_pair",
          "name": "z_trunk",
          "tex": "z^{trunk}",
          "type": "output",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.pair_state_output"
        },
        {
          "id": "stack_single_input",
          "name": "s",
          "tex": "s",
          "type": "input",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.single_state_input"
        },
        {
          "id": "stack_pair_input",
          "name": "z",
          "tex": "z",
          "type": "input",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.pair_state_input"
        },
        {
          "id": "stack_token_mask",
          "name": "token_mask",
          "type": "mask",
          "shape": "N_token",
          "representationRef": "representations.token_mask",
          "scale": "token",
          "glyph": "vector",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.token_mask_input"
        },
        {
          "id": "stack_pair_mask",
          "name": "pair_mask",
          "type": "mask",
          "shape": "N_token x N_token",
          "representationRef": "representations.pair_mask",
          "scale": "token_pair",
          "glyph": "matrix",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.pair_mask_input"
        },
        {
          "id": "block_single",
          "name": "s_i",
          "tex": "s_i",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.block_single_state"
        },
        {
          "id": "block_pair",
          "name": "z_i",
          "tex": "z_i",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.block_pair_state"
        },
        {
          "id": "updated_pair",
          "name": "z_next",
          "tex": "z_{i+1}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.pair_after_transition"
        },
        {
          "id": "updated_single",
          "name": "s_next",
          "tex": "s_{i+1}",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.single_after_transition"
        },
        {
          "id": "stack_output_single",
          "name": "s_trunk",
          "tex": "s^{trunk}",
          "type": "output",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.single_state_output"
        },
        {
          "id": "stack_output_pair",
          "name": "z_trunk",
          "tex": "z^{trunk}",
          "type": "output",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.pair_state_output"
        },
        {
          "id": "pair_input",
          "name": "z_i",
          "tex": "z_i",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.block_pair_state"
        },
        {
          "id": "pair_scope_mask",
          "name": "pair_mask",
          "type": "mask",
          "shape": "N_token x N_token",
          "representationRef": "representations.pair_mask",
          "scale": "token_pair",
          "glyph": "matrix",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_mask_input"
        },
        {
          "id": "pair_outgoing",
          "name": "z_out",
          "tex": "z^{out}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_outgoing_multiplication"
        },
        {
          "id": "pair_incoming",
          "name": "z_in",
          "tex": "z^{in}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_incoming_multiplication"
        },
        {
          "id": "pair_starting",
          "name": "z_start",
          "tex": "z^{start}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_starting_attention"
        },
        {
          "id": "pair_ending",
          "name": "z_end",
          "tex": "z^{end}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_ending_attention"
        },
        {
          "id": "pair_output",
          "name": "z_next",
          "tex": "z_{i+1}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_transition"
        },
        {
          "id": "single_input",
          "name": "s_i",
          "tex": "s_i",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.block_single_state"
        },
        {
          "id": "single_pair_input",
          "name": "z_next",
          "tex": "z_{i+1}",
          "type": "representation",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.pair_after_transition"
        },
        {
          "id": "single_scope_mask",
          "name": "token_mask",
          "type": "mask",
          "shape": "N_token",
          "representationRef": "representations.token_mask",
          "scale": "token",
          "glyph": "vector",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.token_mask_input"
        },
        {
          "id": "pair_logits",
          "name": "pair_logits",
          "type": "conditioning",
          "shape": "16 x N_token x N_token",
          "representationRef": "representations.pair_attention_logits",
          "scale": "token_pair",
          "glyph": "volume",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.single_pair_attention_logits"
        },
        {
          "id": "single_attention_state",
          "name": "s_attn",
          "tex": "s^{attn}",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.single_after_pair_attention"
        },
        {
          "id": "single_output",
          "name": "s_next",
          "tex": "s_{i+1}",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.single_after_transition"
        }
      ],
      "lines": [
        {
          "id": "run_pairformer",
          "text": "s_trunk, z_trunk = PairformerStack(s, z, token_mask, pair_mask)",
          "comment": "The component boundary starts after AF3 has already embedded the token and pair inputs.",
          "refs": "pairformer_stack application",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "pairformer_stack application"
            }
          ],
          "scopeRef": "scopes.pairformer",
          "statementRef": "modules.pairformer_stack",
          "calleeScopeRef": "scopes.stack",
          "architectureRefs": [
            "modules.pairformer_stack",
            "claims.pairformer_has_no_msa_state"
          ],
          "operation": "run_pairformer_stack",
          "inputs": [
            "input_single",
            "input_pair",
            "input_token_mask",
            "input_pair_mask"
          ],
          "outputs": [
            "output_single",
            "output_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "s_trunk",
              "access": "write",
              "symbolId": "output_single",
              "tex": "s^{trunk}",
              "architectureRef": "value_sites.single_state_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 7
                }
              ]
            },
            {
              "lexeme": "z_trunk",
              "access": "write",
              "symbolId": "output_pair",
              "tex": "z^{trunk}",
              "architectureRef": "value_sites.pair_state_output",
              "occurrences": [
                {
                  "start": 9,
                  "end": 16
                }
              ]
            },
            {
              "lexeme": "PairformerStack",
              "access": "call",
              "architectureRef": "modules.pairformer_stack",
              "occurrences": [
                {
                  "start": 19,
                  "end": 34
                }
              ]
            },
            {
              "lexeme": "s",
              "access": "read",
              "symbolId": "input_single",
              "tex": "s",
              "architectureRef": "value_sites.single_state_input",
              "occurrences": [
                {
                  "start": 35,
                  "end": 36
                }
              ]
            },
            {
              "lexeme": "z",
              "access": "read",
              "symbolId": "input_pair",
              "tex": "z",
              "architectureRef": "value_sites.pair_state_input",
              "occurrences": [
                {
                  "start": 38,
                  "end": 39
                }
              ]
            },
            {
              "lexeme": "token_mask",
              "access": "read",
              "symbolId": "input_token_mask",
              "architectureRef": "value_sites.token_mask_input",
              "occurrences": [
                {
                  "start": 41,
                  "end": 51
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "input_pair_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 53,
                  "end": 62
                }
              ]
            }
          ]
        },
        {
          "id": "initialize_pair_state",
          "text": "z_i = z",
          "refs": "pairformer_stack input",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "pairformer_stack input"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.input_pair_state_initializes_block_pair_state",
          "architectureRefs": [
            "relations.input_pair_state_initializes_block_pair_state"
          ],
          "operation": "initialize_pair_state",
          "inputs": [
            "stack_pair_input"
          ],
          "outputs": [
            "block_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "z_i",
              "access": "write",
              "symbolId": "block_pair",
              "tex": "z_i",
              "architectureRef": "value_sites.block_pair_state",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "z",
              "access": "read",
              "symbolId": "stack_pair_input",
              "tex": "z",
              "architectureRef": "value_sites.pair_state_input",
              "occurrences": [
                {
                  "start": 6,
                  "end": 7
                }
              ]
            }
          ]
        },
        {
          "id": "initialize_single_state",
          "text": "s_i = s",
          "refs": "pairformer_stack input",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "pairformer_stack input"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.input_single_state_initializes_block_single_state",
          "architectureRefs": [
            "relations.input_single_state_initializes_block_single_state"
          ],
          "operation": "initialize_single_state",
          "inputs": [
            "stack_single_input"
          ],
          "outputs": [
            "block_single"
          ],
          "codeBindings": [
            {
              "lexeme": "s_i",
              "access": "write",
              "symbolId": "block_single",
              "tex": "s_i",
              "architectureRef": "value_sites.block_single_state",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "s",
              "access": "read",
              "symbolId": "stack_single_input",
              "tex": "s",
              "architectureRef": "value_sites.single_state_input",
              "occurrences": [
                {
                  "start": 6,
                  "end": 7
                }
              ]
            }
          ]
        },
        {
          "id": "run_pair_update",
          "text": "z_next = PairUpdate(z_i, pair_mask)",
          "comment": "All five pair residual updates complete before the single track reads z_next.",
          "refs": "PairFormerIteration.__call__ pair updates",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration.__call__ pair updates"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "modules.pair_update_stage",
          "calleeScopeRef": "scopes.pair_update",
          "architectureRefs": [
            "modules.pair_update_stage",
            "claims.pair_track_precedes_single_track"
          ],
          "operation": "update_pair_track",
          "inputs": [
            "block_pair",
            "stack_pair_mask"
          ],
          "outputs": [
            "updated_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "z_next",
              "access": "write",
              "symbolId": "updated_pair",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "PairUpdate",
              "access": "call",
              "architectureRef": "modules.pair_update_stage",
              "occurrences": [
                {
                  "start": 9,
                  "end": 19
                }
              ]
            },
            {
              "lexeme": "z_i",
              "access": "read",
              "symbolId": "block_pair",
              "tex": "z_i",
              "architectureRef": "value_sites.block_pair_state",
              "occurrences": [
                {
                  "start": 20,
                  "end": 23
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "stack_pair_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 25,
                  "end": 34
                }
              ]
            }
          ]
        },
        {
          "id": "run_single_update",
          "text": "s_next = SingleUpdate(s_i, z_next, token_mask)",
          "refs": "PairFormerIteration.__call__ single updates",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration.__call__ single updates"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "modules.single_update_stage",
          "calleeScopeRef": "scopes.single_update",
          "architectureRefs": [
            "modules.single_update_stage",
            "claims.pair_state_does_not_receive_single_update"
          ],
          "operation": "update_single_track",
          "inputs": [
            "block_single",
            "updated_pair",
            "stack_token_mask"
          ],
          "outputs": [
            "updated_single"
          ],
          "codeBindings": [
            {
              "lexeme": "s_next",
              "access": "write",
              "symbolId": "updated_single",
              "tex": "s_{i+1}",
              "architectureRef": "value_sites.single_after_transition",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "SingleUpdate",
              "access": "call",
              "architectureRef": "modules.single_update_stage",
              "occurrences": [
                {
                  "start": 9,
                  "end": 21
                }
              ]
            },
            {
              "lexeme": "s_i",
              "access": "read",
              "symbolId": "block_single",
              "tex": "s_i",
              "architectureRef": "value_sites.block_single_state",
              "occurrences": [
                {
                  "start": 22,
                  "end": 25
                }
              ]
            },
            {
              "lexeme": "z_next",
              "access": "read",
              "symbolId": "updated_pair",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 27,
                  "end": 33
                }
              ]
            },
            {
              "lexeme": "token_mask",
              "access": "read",
              "symbolId": "stack_token_mask",
              "architectureRef": "value_sites.token_mask_input",
              "occurrences": [
                {
                  "start": 35,
                  "end": 45
                }
              ]
            }
          ]
        },
        {
          "id": "carry_pair_state",
          "text": "z_i = z_next",
          "refs": "hk.experimental.layer_stack",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "hk.experimental.layer_stack"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.block_pair_output_reenters_next_pairformer_block",
          "architectureRefs": [
            "relations.block_pair_output_reenters_next_pairformer_block",
            "execution.loops.pairformer_stack"
          ],
          "operation": "advance_pair_block_state",
          "inputs": [
            "updated_pair"
          ],
          "outputs": [
            "block_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "z_i",
              "access": "write",
              "symbolId": "block_pair",
              "tex": "z_i",
              "architectureRef": "value_sites.block_pair_state",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "z_next",
              "access": "read",
              "symbolId": "updated_pair",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 6,
                  "end": 12
                }
              ]
            }
          ]
        },
        {
          "id": "carry_single_state",
          "text": "s_i = s_next",
          "refs": "hk.experimental.layer_stack",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "hk.experimental.layer_stack"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.block_single_output_reenters_next_pairformer_block",
          "architectureRefs": [
            "relations.block_single_output_reenters_next_pairformer_block",
            "execution.loops.pairformer_stack"
          ],
          "operation": "advance_single_block_state",
          "inputs": [
            "updated_single"
          ],
          "outputs": [
            "block_single"
          ],
          "codeBindings": [
            {
              "lexeme": "s_i",
              "access": "write",
              "symbolId": "block_single",
              "tex": "s_i",
              "architectureRef": "value_sites.block_single_state",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "s_next",
              "access": "read",
              "symbolId": "updated_single",
              "tex": "s_{i+1}",
              "architectureRef": "value_sites.single_after_transition",
              "occurrences": [
                {
                  "start": 6,
                  "end": 12
                }
              ]
            }
          ]
        },
        {
          "id": "expose_pair_output",
          "text": "z_trunk = z_next",
          "refs": "pair_activations output",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "pair_activations output"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.final_pair_block_state_becomes_output",
          "architectureRefs": [
            "relations.final_pair_block_state_becomes_output"
          ],
          "operation": "expose_final_pair_state",
          "inputs": [
            "updated_pair"
          ],
          "outputs": [
            "stack_output_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "z_trunk",
              "access": "write",
              "symbolId": "stack_output_pair",
              "tex": "z^{trunk}",
              "architectureRef": "value_sites.pair_state_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 7
                }
              ]
            },
            {
              "lexeme": "z_next",
              "access": "read",
              "symbolId": "updated_pair",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 10,
                  "end": 16
                }
              ]
            }
          ]
        },
        {
          "id": "expose_single_output",
          "text": "s_trunk = s_next",
          "refs": "single_activations output",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "single_activations output"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.final_single_block_state_becomes_output",
          "architectureRefs": [
            "relations.final_single_block_state_becomes_output"
          ],
          "operation": "expose_final_single_state",
          "inputs": [
            "updated_single"
          ],
          "outputs": [
            "stack_output_single"
          ],
          "codeBindings": [
            {
              "lexeme": "s_trunk",
              "access": "write",
              "symbolId": "stack_output_single",
              "tex": "s^{trunk}",
              "architectureRef": "value_sites.single_state_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 7
                }
              ]
            },
            {
              "lexeme": "s_next",
              "access": "read",
              "symbolId": "updated_single",
              "tex": "s_{i+1}",
              "architectureRef": "value_sites.single_after_transition",
              "occurrences": [
                {
                  "start": 10,
                  "end": 16
                }
              ]
            }
          ]
        },
        {
          "id": "outgoing_triangle_update",
          "text": "z_out = z_i + TriangleMultiplicationOutgoing(z_i, pair_mask)",
          "refs": "PairFormerIteration triangle_multiplication_outgoing",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration triangle_multiplication_outgoing"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.triangle_multiplication_outgoing",
          "architectureRefs": [
            "modules.triangle_multiplication_outgoing"
          ],
          "operation": "residual_outgoing_triangle_multiplication",
          "inputs": [
            "pair_input",
            "pair_scope_mask"
          ],
          "outputs": [
            "pair_outgoing"
          ],
          "codeBindings": [
            {
              "lexeme": "z_out",
              "access": "write",
              "symbolId": "pair_outgoing",
              "tex": "z^{out}",
              "architectureRef": "value_sites.pair_after_outgoing_multiplication",
              "occurrences": [
                {
                  "start": 0,
                  "end": 5
                }
              ]
            },
            {
              "lexeme": "z_i",
              "access": "read",
              "symbolId": "pair_input",
              "tex": "z_i",
              "architectureRef": "value_sites.block_pair_state",
              "occurrences": [
                {
                  "start": 8,
                  "end": 11
                },
                {
                  "start": 45,
                  "end": 48
                }
              ]
            },
            {
              "lexeme": "TriangleMultiplicationOutgoing",
              "access": "call",
              "architectureRef": "modules.triangle_multiplication_outgoing",
              "occurrences": [
                {
                  "start": 14,
                  "end": 44
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "pair_scope_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 50,
                  "end": 59
                }
              ]
            }
          ]
        },
        {
          "id": "incoming_triangle_update",
          "text": "z_in = z_out + TriangleMultiplicationIncoming(z_out, pair_mask)",
          "refs": "PairFormerIteration triangle_multiplication_incoming",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration triangle_multiplication_incoming"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.triangle_multiplication_incoming",
          "architectureRefs": [
            "modules.triangle_multiplication_incoming"
          ],
          "operation": "residual_incoming_triangle_multiplication",
          "inputs": [
            "pair_outgoing",
            "pair_scope_mask"
          ],
          "outputs": [
            "pair_incoming"
          ],
          "codeBindings": [
            {
              "lexeme": "z_in",
              "access": "write",
              "symbolId": "pair_incoming",
              "tex": "z^{in}",
              "architectureRef": "value_sites.pair_after_incoming_multiplication",
              "occurrences": [
                {
                  "start": 0,
                  "end": 4
                }
              ]
            },
            {
              "lexeme": "z_out",
              "access": "read",
              "symbolId": "pair_outgoing",
              "tex": "z^{out}",
              "architectureRef": "value_sites.pair_after_outgoing_multiplication",
              "occurrences": [
                {
                  "start": 7,
                  "end": 12
                },
                {
                  "start": 46,
                  "end": 51
                }
              ]
            },
            {
              "lexeme": "TriangleMultiplicationIncoming",
              "access": "call",
              "architectureRef": "modules.triangle_multiplication_incoming",
              "occurrences": [
                {
                  "start": 15,
                  "end": 45
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "pair_scope_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 53,
                  "end": 62
                }
              ]
            }
          ]
        },
        {
          "id": "starting_node_attention_update",
          "text": "z_start = z_in + TriangleAttentionStartingNode(z_in, pair_mask)",
          "refs": "PairFormerIteration pair_attention1 transpose=False",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration pair_attention1 transpose=False"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.pair_attention_starting_node",
          "architectureRefs": [
            "modules.pair_attention_starting_node"
          ],
          "operation": "residual_starting_node_attention",
          "inputs": [
            "pair_incoming",
            "pair_scope_mask"
          ],
          "outputs": [
            "pair_starting"
          ],
          "codeBindings": [
            {
              "lexeme": "z_start",
              "access": "write",
              "symbolId": "pair_starting",
              "tex": "z^{start}",
              "architectureRef": "value_sites.pair_after_starting_attention",
              "occurrences": [
                {
                  "start": 0,
                  "end": 7
                }
              ]
            },
            {
              "lexeme": "z_in",
              "access": "read",
              "symbolId": "pair_incoming",
              "tex": "z^{in}",
              "architectureRef": "value_sites.pair_after_incoming_multiplication",
              "occurrences": [
                {
                  "start": 10,
                  "end": 14
                },
                {
                  "start": 47,
                  "end": 51
                }
              ]
            },
            {
              "lexeme": "TriangleAttentionStartingNode",
              "access": "call",
              "architectureRef": "modules.pair_attention_starting_node",
              "occurrences": [
                {
                  "start": 17,
                  "end": 46
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "pair_scope_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 53,
                  "end": 62
                }
              ]
            }
          ]
        },
        {
          "id": "ending_node_attention_update",
          "text": "z_end = z_start + TriangleAttentionEndingNode(z_start, pair_mask)",
          "refs": "PairFormerIteration pair_attention2 transpose=True",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration pair_attention2 transpose=True"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.pair_attention_ending_node",
          "architectureRefs": [
            "modules.pair_attention_ending_node"
          ],
          "operation": "residual_ending_node_attention",
          "inputs": [
            "pair_starting",
            "pair_scope_mask"
          ],
          "outputs": [
            "pair_ending"
          ],
          "codeBindings": [
            {
              "lexeme": "z_end",
              "access": "write",
              "symbolId": "pair_ending",
              "tex": "z^{end}",
              "architectureRef": "value_sites.pair_after_ending_attention",
              "occurrences": [
                {
                  "start": 0,
                  "end": 5
                }
              ]
            },
            {
              "lexeme": "z_start",
              "access": "read",
              "symbolId": "pair_starting",
              "tex": "z^{start}",
              "architectureRef": "value_sites.pair_after_starting_attention",
              "occurrences": [
                {
                  "start": 8,
                  "end": 15
                },
                {
                  "start": 46,
                  "end": 53
                }
              ]
            },
            {
              "lexeme": "TriangleAttentionEndingNode",
              "access": "call",
              "architectureRef": "modules.pair_attention_ending_node",
              "occurrences": [
                {
                  "start": 18,
                  "end": 45
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "pair_scope_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 55,
                  "end": 64
                }
              ]
            }
          ]
        },
        {
          "id": "pair_transition_update",
          "text": "z_next = z_end + PairTransition(z_end)",
          "refs": "PairFormerIteration pair_transition and TransitionBlock",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration pair_transition and TransitionBlock"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.pair_transition",
          "architectureRefs": [
            "modules.pair_transition"
          ],
          "operation": "residual_pair_transition",
          "inputs": [
            "pair_ending"
          ],
          "outputs": [
            "pair_output"
          ],
          "codeBindings": [
            {
              "lexeme": "z_next",
              "access": "write",
              "symbolId": "pair_output",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "z_end",
              "access": "read",
              "symbolId": "pair_ending",
              "tex": "z^{end}",
              "architectureRef": "value_sites.pair_after_ending_attention",
              "occurrences": [
                {
                  "start": 9,
                  "end": 14
                },
                {
                  "start": 32,
                  "end": 37
                }
              ]
            },
            {
              "lexeme": "PairTransition",
              "access": "call",
              "architectureRef": "modules.pair_transition",
              "occurrences": [
                {
                  "start": 17,
                  "end": 31
                }
              ]
            }
          ]
        },
        {
          "id": "project_pair_logits",
          "text": "pair_logits = Linear16(LayerNorm(z_next))",
          "refs": "single_pair_logits_norm and single_pair_logits_projection",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "single_pair_logits_norm and single_pair_logits_projection"
            }
          ],
          "scopeRef": "scopes.single_update",
          "statementRef": "modules.single_pair_logits_projection",
          "architectureRefs": [
            "modules.single_pair_logits_projection"
          ],
          "operation": "project_pair_attention_logits",
          "inputs": [
            "single_pair_input"
          ],
          "outputs": [
            "pair_logits"
          ],
          "codeBindings": [
            {
              "lexeme": "pair_logits",
              "access": "write",
              "symbolId": "pair_logits",
              "architectureRef": "value_sites.single_pair_attention_logits",
              "occurrences": [
                {
                  "start": 0,
                  "end": 11
                }
              ]
            },
            {
              "lexeme": "Linear16",
              "access": "call",
              "architectureRef": "modules.single_pair_logits_projection",
              "occurrences": [
                {
                  "start": 14,
                  "end": 22
                }
              ]
            },
            {
              "lexeme": "z_next",
              "access": "read",
              "symbolId": "single_pair_input",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 33,
                  "end": 39
                }
              ]
            }
          ]
        },
        {
          "id": "pair_biased_single_attention_update",
          "text": "s_attn = s_i + SingleAttention(s_i, token_mask, pair_logits)",
          "refs": "PairFormerIteration single_attention_ call, self_attention",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration single_attention_ call"
            },
            {
              "source": "single_attention_code",
              "locator": "self_attention"
            }
          ],
          "scopeRef": "scopes.single_update",
          "statementRef": "modules.single_attention_with_pair_bias",
          "architectureRefs": [
            "modules.single_attention_with_pair_bias",
            "relations.pair_logits_bias_single_attention"
          ],
          "operation": "residual_pair_biased_single_attention",
          "inputs": [
            "single_input",
            "single_scope_mask",
            "pair_logits"
          ],
          "outputs": [
            "single_attention_state"
          ],
          "codeBindings": [
            {
              "lexeme": "s_attn",
              "access": "write",
              "symbolId": "single_attention_state",
              "tex": "s^{attn}",
              "architectureRef": "value_sites.single_after_pair_attention",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "s_i",
              "access": "read",
              "symbolId": "single_input",
              "tex": "s_i",
              "architectureRef": "value_sites.block_single_state",
              "occurrences": [
                {
                  "start": 9,
                  "end": 12
                },
                {
                  "start": 31,
                  "end": 34
                }
              ]
            },
            {
              "lexeme": "SingleAttention",
              "access": "call",
              "architectureRef": "modules.single_attention_with_pair_bias",
              "occurrences": [
                {
                  "start": 15,
                  "end": 30
                }
              ]
            },
            {
              "lexeme": "token_mask",
              "access": "read",
              "symbolId": "single_scope_mask",
              "architectureRef": "value_sites.token_mask_input",
              "occurrences": [
                {
                  "start": 36,
                  "end": 46
                }
              ]
            },
            {
              "lexeme": "pair_logits",
              "access": "read",
              "symbolId": "pair_logits",
              "architectureRef": "value_sites.single_pair_attention_logits",
              "occurrences": [
                {
                  "start": 48,
                  "end": 59
                }
              ]
            }
          ]
        },
        {
          "id": "single_transition_update",
          "text": "s_next = s_attn + SingleTransition(s_attn)",
          "refs": "PairFormerIteration single_transition and TransitionBlock",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration single_transition and TransitionBlock"
            }
          ],
          "scopeRef": "scopes.single_update",
          "statementRef": "modules.single_transition",
          "architectureRefs": [
            "modules.single_transition"
          ],
          "operation": "residual_single_transition",
          "inputs": [
            "single_attention_state"
          ],
          "outputs": [
            "single_output"
          ],
          "codeBindings": [
            {
              "lexeme": "s_next",
              "access": "write",
              "symbolId": "single_output",
              "tex": "s_{i+1}",
              "architectureRef": "value_sites.single_after_transition",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "s_attn",
              "access": "read",
              "symbolId": "single_attention_state",
              "tex": "s^{attn}",
              "architectureRef": "value_sites.single_after_pair_attention",
              "occurrences": [
                {
                  "start": 9,
                  "end": 15
                },
                {
                  "start": 35,
                  "end": 41
                }
              ]
            },
            {
              "lexeme": "SingleTransition",
              "access": "call",
              "architectureRef": "modules.single_transition",
              "occurrences": [
                {
                  "start": 18,
                  "end": 34
                }
              ]
            }
          ]
        }
      ],
      "claims": [
        {
          "id": "pair_updates_are_sequential",
          "statement": "Every pair residual update reads the state produced by the immediately preceding pair operation.",
          "line_refs": [
            "outgoing_triangle_update",
            "incoming_triangle_update",
            "starting_node_attention_update",
            "ending_node_attention_update",
            "pair_transition_update"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "af3_pairformer_code",
                "role": "implementation_evidence",
                "locator": "PairFormerIteration.__call__"
              }
            ]
          }
        },
        {
          "id": "pair_to_single_path_is_logit_bias",
          "statement": "Pair state affects the single update through additive per-head attention logits rather than through concatenation with the single values.",
          "line_refs": [
            "project_pair_logits",
            "pair_biased_single_attention_update"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "af3_pairformer_code",
                "role": "implementation_evidence",
                "locator": "single_pair_logits_projection"
              },
              {
                "source_ref": "af3_self_attention_code",
                "role": "implementation_evidence",
                "locator": "self_attention logits += pair_logits"
              }
            ]
          }
        }
      ],
      "sourceYaml": "../../pseudocode/alphafold3-pairformer.yaml"
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/alphafold3-pairformer-semantic-zoom.view.yaml",
    "rootBoard": "pairformer_overview",
    "items": [
      {
        "id": "pairformer_overview",
        "title": "AlphaFold 3",
        "summary": "AF3 replaces AF2's fixed one-hot residue vocabulary with real per-atom self-attention over each token's own reference-conformer geometry, letting one architecture handle standard residues, modified residues, and arbitrary ligands uniformly while building the single and pair representations. The MSA module then reads the raw per-row MSA and folds evolutionary coupling, correlated variation across aligned sequences, into the pair representation, the only place in the model where that happens. Forty-eight independently parameterized Pairformer blocks then refine both tracks and return them to downstream AF3 modules.",
        "subject_ref": "architecture",
        "expansion_depth": 1,
        "grid": {
          "columns": 11,
          "rows": 5,
          "column_sizing": "content",
          "col_gap": 40,
          "row_gap": 32
        },
        "nodes": [
          {
            "id": "atom_reference_features_input",
            "ref": "value_sites.atom_reference_features_input",
            "label": "reference conformer",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "restype_input",
            "ref": "value_sites.restype_input",
            "label": "restype",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 2
          },
          {
            "id": "profile_input",
            "ref": "value_sites.profile_input",
            "label": "MSA profile",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 4
          },
          {
            "id": "deletion_mean_input",
            "ref": "value_sites.deletion_mean_input",
            "label": "deletion mean",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 5
          },
          {
            "id": "input_feature_embedder",
            "ref": "modules.input_feature_embedder",
            "label": "Input Feature Embedder",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 3,
            "board_ref": "input_feature_embedder_detail"
          },
          {
            "id": "s_inputs",
            "ref": "value_sites.s_inputs",
            "label": "input embedding",
            "notation": "s^{inputs}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 3
          },
          {
            "id": "single_state_input_projection",
            "ref": "modules.single_state_input_projection",
            "label": "project singles",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 4,
            "row": 2
          },
          {
            "id": "pair_state_input_projection",
            "ref": "modules.pair_state_input_projection",
            "label": "project pairs",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 4,
            "row": 4
          },
          {
            "id": "token_mask_input",
            "ref": "value_sites.token_mask_input",
            "label": "token mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 5,
            "row": 1
          },
          {
            "id": "pair_mask_input",
            "ref": "value_sites.pair_mask_input",
            "label": "pair mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 5,
            "row": 5
          },
          {
            "id": "msa_input",
            "ref": "value_sites.msa_input",
            "label": "MSA identity",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 6,
            "row": 1
          },
          {
            "id": "has_deletion_input",
            "ref": "value_sites.has_deletion_input",
            "label": "has deletion",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 6,
            "row": 2
          },
          {
            "id": "deletion_value_input",
            "ref": "value_sites.deletion_value_input",
            "label": "deletion value",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 6,
            "row": 4
          },
          {
            "id": "msa_module",
            "ref": "modules.msa_module",
            "label": "MSA Module",
            "prominence": "primary",
            "treatment": "block",
            "col": 7,
            "row": 3,
            "board_ref": "msa_module_detail"
          },
          {
            "id": "pairformer_stack",
            "ref": "modules.pairformer_stack",
            "label": "48-block Pairformer",
            "prominence": "primary",
            "treatment": "block",
            "col": 9,
            "row": 3,
            "board_ref": "pairformer_block"
          },
          {
            "id": "single_state_output",
            "ref": "value_sites.single_state_output",
            "label": "trunk singles",
            "notation": "s^{trunk}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 11,
            "row": 2
          },
          {
            "id": "pair_state_output",
            "ref": "value_sites.pair_state_output",
            "label": "trunk pairs",
            "notation": "z^{trunk}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 11,
            "row": 4
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.final_single_block_state_becomes_output"
            },
            "label": "s^{trunk}",
            "connection": {
              "title": "Final single representation",
              "role": "downstream trunk state",
              "inside": "After block 48, the token-wise state is exposed to downstream AF3 modules."
            }
          },
          {
            "match": {
              "relation_ref": "relations.final_pair_block_state_becomes_output"
            },
            "label": "z^{trunk}",
            "connection": {
              "title": "Final pair representation",
              "role": "downstream pair context",
              "inside": "After block 48, the ordered token-pair state is exposed to downstream AF3 modules."
            }
          }
        ],
        "elide": [
          {
            "ref": "value_sites.single_state_input"
          },
          {
            "ref": "value_sites.pair_state_input"
          },
          {
            "ref": "value_sites.z_init"
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_8c664ba9889f",
            "from": "atom_reference_features_input",
            "to": "input_feature_embedder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.atom_reference_features_enter_atom_attention_encoder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.atom_reference_features_enter_atom_attention_encoder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.atom_reference_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a0bc60a6e04d",
            "from": "deletion_mean_input",
            "to": "input_feature_embedder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.deletion_mean_enters_concatenation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.deletion_mean_enters_concatenation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.deletion_mean"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_2ec3a4250502",
            "from": "deletion_value_input",
            "to": "msa_module",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.deletion_value_enters_row_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.deletion_value_enters_row_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.deletion_value"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_47ae297573c2",
            "from": "has_deletion_input",
            "to": "msa_module",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.has_deletion_enters_row_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.has_deletion_enters_row_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.has_deletion"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_ed195414faf6",
            "from": "input_feature_embedder",
            "to": "s_inputs",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.concatenation_produces_s_inputs"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.concatenation_produces_s_inputs"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.s_inputs"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_c21ce4106938",
            "from": "msa_input",
            "to": "msa_module",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_input_enters_row_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_input_enters_row_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_identity"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_11ee4bd8bcaf",
            "from": "msa_module",
            "to": "pairformer_stack",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.msa_module_pair_output_becomes_pair_state_input",
              "relations.input_pair_state_initializes_block_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_module_pair_output_becomes_pair_state_input"
              },
              {
                "relation_ref": "relations.input_pair_state_initializes_block_pair_state"
              }
            ],
            "hidden_refs": [
              "value_sites.pair_state_input"
            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_7d57332cdd97",
            "from": "pair_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_f24e2d2d57f1",
            "from": "pair_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_42be7a59d897",
            "from": "pair_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_fe4f7af85d32",
            "from": "pair_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_dba7f39ba072",
            "from": "pair_state_input_projection",
            "to": "msa_module",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_state_projection_produces_z_init",
              "relations.z_init_initializes_msa_module_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_state_projection_produces_z_init"
              },
              {
                "relation_ref": "relations.z_init_initializes_msa_module_pair_state"
              }
            ],
            "hidden_refs": [
              "value_sites.z_init"
            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_97d1e9fd492c",
            "from": "pairformer_stack",
            "to": "pair_state_output",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.final_pair_block_state_becomes_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_pair_block_state_becomes_output"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z^{trunk}",
              "connection": {
                "title": "Final pair representation",
                "role": "downstream pair context",
                "inside": "After block 48, the ordered token-pair state is exposed to downstream AF3 modules."
              }
            }
          },
          {
            "id": "projection_3db1d176a533",
            "from": "pairformer_stack",
            "to": "single_state_output",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.final_single_block_state_becomes_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_single_block_state_becomes_output"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "s^{trunk}",
              "connection": {
                "title": "Final single representation",
                "role": "downstream trunk state",
                "inside": "After block 48, the token-wise state is exposed to downstream AF3 modules."
              }
            }
          },
          {
            "id": "projection_2ecd6694aa72",
            "from": "profile_input",
            "to": "input_feature_embedder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.profile_enters_concatenation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.profile_enters_concatenation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.profile"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_64699a528d0f",
            "from": "restype_input",
            "to": "input_feature_embedder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.restype_enters_concatenation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.restype_enters_concatenation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.restype"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_f4545d04684c",
            "from": "s_inputs",
            "to": "msa_module",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.s_inputs_enters_msa_row_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.s_inputs_enters_msa_row_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.s_inputs"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_e702e26247ec",
            "from": "s_inputs",
            "to": "pair_state_input_projection",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.s_inputs_enters_pair_state_projection"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.s_inputs_enters_pair_state_projection"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.s_inputs"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_3d1249db30c6",
            "from": "s_inputs",
            "to": "single_state_input_projection",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.s_inputs_enters_single_state_projection"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.s_inputs_enters_single_state_projection"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.s_inputs"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a09034493b88",
            "from": "single_state_input_projection",
            "to": "pairformer_stack",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.single_state_projection_produces_single_state_input",
              "relations.input_single_state_initializes_block_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_state_projection_produces_single_state_input"
              },
              {
                "relation_ref": "relations.input_single_state_initializes_block_single_state"
              }
            ],
            "hidden_refs": [
              "value_sites.single_state_input"
            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_d3b940b30ce4",
            "from": "token_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.token_mask_conditions_single_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.token_mask_conditions_single_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_mask"
            ],
            "presentation": {
            }
          }
        ],
        "classifications": {
          "modules.atom_attention_encoder_bare": "collapsed:modules.input_feature_embedder",
          "modules.input_feature_concatenation": "collapsed:modules.input_feature_embedder",
          "modules.input_feature_embedder": "visible",
          "modules.msa_module": "visible",
          "modules.msa_pair_attention_ending_node": "collapsed:modules.msa_module",
          "modules.msa_pair_attention_starting_node": "collapsed:modules.msa_module",
          "modules.msa_pair_transition": "collapsed:modules.msa_module",
          "modules.msa_pair_weighted_averaging": "collapsed:modules.msa_module",
          "modules.msa_row_embedding": "collapsed:modules.msa_module",
          "modules.msa_transition": "collapsed:modules.msa_module",
          "modules.msa_triangle_multiplication_incoming": "collapsed:modules.msa_module",
          "modules.msa_triangle_multiplication_outgoing": "collapsed:modules.msa_module",
          "modules.outer_product_mean": "collapsed:modules.msa_module",
          "modules.pair_attention_ending_node": "collapsed:modules.pairformer_stack",
          "modules.pair_attention_starting_node": "collapsed:modules.pairformer_stack",
          "modules.pair_state_input_projection": "visible",
          "modules.pair_transition": "collapsed:modules.pairformer_stack",
          "modules.pairformer_stack": "visible",
          "modules.single_attention_with_pair_bias": "collapsed:modules.pairformer_stack",
          "modules.single_pair_logits_projection": "collapsed:modules.pairformer_stack",
          "modules.single_state_input_projection": "visible",
          "modules.single_transition": "collapsed:modules.pairformer_stack",
          "modules.triangle_multiplication_incoming": "collapsed:modules.pairformer_stack",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.pairformer_stack",
          "value_sites.atom_reference_features_input": "visible",
          "value_sites.block_pair_state": "collapsed:modules.pairformer_stack",
          "value_sites.block_single_state": "collapsed:modules.pairformer_stack",
          "value_sites.deletion_mean_input": "visible",
          "value_sites.deletion_value_input": "visible",
          "value_sites.has_deletion_input": "visible",
          "value_sites.msa_activations": "collapsed:modules.msa_module",
          "value_sites.msa_activations_after_pair_weighted_averaging": "collapsed:modules.msa_module",
          "value_sites.msa_activations_after_transition": "collapsed:modules.msa_module",
          "value_sites.msa_input": "visible",
          "value_sites.msa_module_pair_state_read": "collapsed:modules.msa_module",
          "value_sites.msa_pair_after_ending_attention": "collapsed:modules.msa_module",
          "value_sites.msa_pair_after_incoming_multiplication": "collapsed:modules.msa_module",
          "value_sites.msa_pair_after_outgoing_multiplication": "collapsed:modules.msa_module",
          "value_sites.msa_pair_after_starting_attention": "collapsed:modules.msa_module",
          "value_sites.msa_pair_after_transition": "collapsed:modules.msa_module",
          "value_sites.msa_pair_weighted_averaging_gate": "collapsed:modules.msa_module",
          "value_sites.msa_pair_weighted_averaging_pair_bias": "collapsed:modules.msa_module",
          "value_sites.msa_pair_weighted_averaging_value": "collapsed:modules.msa_module",
          "value_sites.msa_pair_weighted_averaging_weights": "collapsed:modules.msa_module",
          "value_sites.outer_product_mean_flattened": "collapsed:modules.msa_module",
          "value_sites.outer_product_mean_pair_contribution": "collapsed:modules.msa_module",
          "value_sites.outer_product_mean_projection_a": "collapsed:modules.msa_module",
          "value_sites.outer_product_mean_projection_b": "collapsed:modules.msa_module",
          "value_sites.pair_after_ending_attention": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_incoming_multiplication": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_outgoing_multiplication": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_starting_attention": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_transition": "collapsed:modules.pairformer_stack",
          "value_sites.pair_mask_input": "visible",
          "value_sites.pair_state_input": "elided",
          "value_sites.pair_state_output": "visible",
          "value_sites.profile_input": "visible",
          "value_sites.restype_input": "visible",
          "value_sites.s_inputs": "visible",
          "value_sites.single_after_pair_attention": "collapsed:modules.pairformer_stack",
          "value_sites.single_after_transition": "collapsed:modules.pairformer_stack",
          "value_sites.single_pair_attention_logits": "collapsed:modules.pairformer_stack",
          "value_sites.single_state_input": "elided",
          "value_sites.single_state_output": "visible",
          "value_sites.token_mask_input": "visible",
          "value_sites.z_init": "elided"
        },
        "projectionMode": "derived"
      },
      {
        "id": "pairformer_block",
        "title": "One Pairformer Block, Repeated 48 Times",
        "summary": "Each block first completes the pair-track update. Only then is that updated pair state projected to attention logits that bias the single-track update. The two outputs become the next block's inputs.",
        "parent": "pairformer_overview",
        "subject_ref": "modules.pairformer_stack",
        "expansion_depth": 1,
        "grid": {
          "columns": 9,
          "rows": 5,
          "column_sizing": "content",
          "col_gap": 32,
          "row_gap": 30
        },
        "regions": [
          {
            "id": "pairformer_block_iteration",
            "kind": "repeat",
            "execution_ref": "execution.loops.pairformer_stack",
            "label": "one Pairformer block",
            "node_ids": [
              "block_single_state",
              "block_pair_state",
              "pair_update_stage",
              "pair_after_transition",
              "single_update_stage",
              "single_after_transition"
            ],
            "iteration_relation_refs": [
              "relations.block_pair_output_reenters_next_pairformer_block",
              "relations.block_single_output_reenters_next_pairformer_block"
            ]
          }
        ],
        "nodes": [
          {
            "id": "single_state_input",
            "ref": "value_sites.single_state_input",
            "label": "initial singles",
            "notation": "s",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "pair_state_input",
            "ref": "value_sites.pair_state_input",
            "label": "initial pairs",
            "notation": "z",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "block_single_state",
            "ref": "value_sites.block_single_state",
            "label": "block-input singles",
            "notation": "s_i",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2
          },
          {
            "id": "block_pair_state",
            "ref": "value_sites.block_pair_state",
            "label": "block-input pairs",
            "notation": "z_i",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 4
          },
          {
            "id": "pair_mask_input",
            "ref": "value_sites.pair_mask_input",
            "label": "pair mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 3,
            "row": 5
          },
          {
            "id": "pair_update_stage",
            "ref": "modules.pair_update_stage",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 4,
            "board_ref": "pair_track"
          },
          {
            "id": "pair_after_transition",
            "ref": "value_sites.pair_after_transition",
            "label": "updated pairs",
            "notation": "z_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 4
          },
          {
            "id": "token_mask_input",
            "ref": "value_sites.token_mask_input",
            "label": "token mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 5,
            "row": 1
          },
          {
            "id": "single_update_stage",
            "ref": "modules.single_update_stage",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 2,
            "board_ref": "single_track"
          },
          {
            "id": "single_after_transition",
            "ref": "value_sites.single_after_transition",
            "label": "updated singles",
            "notation": "s_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 2
          },
          {
            "id": "single_state_output",
            "ref": "value_sites.single_state_output",
            "label": "final singles",
            "notation": "s^{trunk}",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 9,
            "row": 2
          },
          {
            "id": "pair_state_output",
            "ref": "value_sites.pair_state_output",
            "label": "final pairs",
            "notation": "z^{trunk}",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 9,
            "row": 4
          }
        ],
        "exclude": [
          {
            "ref": "value_sites.single_pair_attention_logits",
            "reason": "The parent block board keeps the single update atomic; its pair-logit intermediate is expanded on the Single Track child board."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.input_pair_state_initializes_block_pair_state"
            },
            "label": "initialize z",
            "connection": {
              "title": "Initialize pair rail",
              "role": "first-block pair state",
              "inside": "The incoming trunk pair representation becomes z_i for the first Pairformer block."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_single_state_initializes_block_single_state"
            },
            "label": "initialize s",
            "connection": {
              "title": "Initialize single rail",
              "role": "first-block single state",
              "inside": "The incoming trunk single representation becomes s_i for the first Pairformer block."
            }
          },
          {
            "match": {
              "relation_ref": "relations.block_pair_state_enters_outgoing_multiplication"
            },
            "label": "z_i",
            "connection": {
              "title": "Pair track enters its five updates",
              "role": "pair reasoning",
              "inside": "The pair update stage applies the two triangle multiplications, two axial attentions, and pair transition in sequence."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_transition_updates_pair_state"
            },
            "label": "five residual updates",
            "connection": {
              "title": "Completed pair track",
              "role": "updated pair state",
              "inside": "The stage emits z_(i+1) only after all five pair residual updates have completed."
            }
          },
          {
            "match": {
              "relation_ref": "relations.updated_pair_state_enters_bias_projection"
            },
            "label": "pair-derived bias",
            "tone": "conditioning",
            "connection": {
              "title": "Updated pairs condition singles",
              "role": "attention-logit bias source",
              "inside": "The updated pair state is normalized and projected to 16 additive logits per ordered token pair inside the single update stage."
            }
          },
          {
            "match": {
              "relation_ref": "relations.block_single_state_enters_pair_biased_attention"
            },
            "label": "s_i",
            "connection": {
              "title": "Single track enters attention",
              "role": "token reasoning",
              "inside": "The block-input single state receives full self-attention conditioned by the updated pair representation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_transition_updates_single_state"
            },
            "label": "attention + transition",
            "connection": {
              "title": "Completed single track",
              "role": "updated single state",
              "inside": "Pair-biased self-attention and a pointwise SwiGLU transition produce s_(i+1)."
            }
          },
          {
            "match": {
              "relation_ref": "relations.block_pair_output_reenters_next_pairformer_block"
            },
            "label": "next block z",
            "tone": "recurrence",
            "route_side": "bottom",
            "route_clearance": 52,
            "connection": {
              "title": "Pair loop carry",
              "role": "next-block state",
              "inside": "The updated pair representation becomes z_i for the next independently parameterized block."
            }
          },
          {
            "match": {
              "relation_ref": "relations.block_single_output_reenters_next_pairformer_block"
            },
            "label": "next block s",
            "tone": "recurrence",
            "route_side": "top",
            "route_clearance": 52,
            "connection": {
              "title": "Single loop carry",
              "role": "next-block state",
              "inside": "The updated single representation becomes s_i for the next independently parameterized block."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_1cd51115ee4a",
            "from": "block_pair_state",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.block_pair_state_enters_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_state_enters_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z_i",
              "connection": {
                "title": "Pair track enters its five updates",
                "role": "pair reasoning",
                "inside": "The pair update stage applies the two triangle multiplications, two axial attentions, and pair transition in sequence."
              }
            }
          },
          {
            "id": "projection_50c473e87b00",
            "from": "block_single_state",
            "to": "single_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.block_single_state_enters_pair_biased_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_state_enters_pair_biased_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "s_i",
              "connection": {
                "title": "Single track enters attention",
                "role": "token reasoning",
                "inside": "The block-input single state receives full self-attention conditioned by the updated pair representation."
              }
            }
          },
          {
            "id": "projection_4dac168e74b4",
            "from": "pair_after_transition",
            "to": "block_pair_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_pair_output_reenters_next_pairformer_block"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_output_reenters_next_pairformer_block"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "next block z",
              "tone": "recurrence",
              "route_side": "bottom",
              "route_clearance": 52,
              "connection": {
                "title": "Pair loop carry",
                "role": "next-block state",
                "inside": "The updated pair representation becomes z_i for the next independently parameterized block."
              }
            }
          },
          {
            "id": "projection_203097cdae97",
            "from": "pair_after_transition",
            "to": "pair_state_output",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.final_pair_block_state_becomes_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_pair_block_state_becomes_output"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_0178261d0909",
            "from": "pair_after_transition",
            "to": "single_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.updated_pair_state_enters_bias_projection"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_pair_state_enters_bias_projection"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "pair-derived bias",
              "tone": "conditioning",
              "connection": {
                "title": "Updated pairs condition singles",
                "role": "attention-logit bias source",
                "inside": "The updated pair state is normalized and projected to 16 additive logits per ordered token pair inside the single update stage."
              }
            }
          },
          {
            "id": "projection_6003fe7b7237",
            "from": "pair_mask_input",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_5632d5bece0f",
            "from": "pair_mask_input",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_8b70fcfbce9d",
            "from": "pair_mask_input",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_453c9a37c45e",
            "from": "pair_mask_input",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_603e772b1d95",
            "from": "pair_state_input",
            "to": "block_pair_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.input_pair_state_initializes_block_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_pair_state_initializes_block_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "initialize z",
              "connection": {
                "title": "Initialize pair rail",
                "role": "first-block pair state",
                "inside": "The incoming trunk pair representation becomes z_i for the first Pairformer block."
              }
            }
          },
          {
            "id": "projection_7b5ca9f4d3d7",
            "from": "pair_update_stage",
            "to": "pair_after_transition",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "five residual updates",
              "connection": {
                "title": "Completed pair track",
                "role": "updated pair state",
                "inside": "The stage emits z_(i+1) only after all five pair residual updates have completed."
              }
            }
          },
          {
            "id": "projection_08dba3f7ee6e",
            "from": "single_after_transition",
            "to": "block_single_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_single_output_reenters_next_pairformer_block"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_output_reenters_next_pairformer_block"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "next block s",
              "tone": "recurrence",
              "route_side": "top",
              "route_clearance": 52,
              "connection": {
                "title": "Single loop carry",
                "role": "next-block state",
                "inside": "The updated single representation becomes s_i for the next independently parameterized block."
              }
            }
          },
          {
            "id": "projection_5177a2f039b1",
            "from": "single_after_transition",
            "to": "single_state_output",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.final_single_block_state_becomes_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_single_block_state_becomes_output"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_6627248ace90",
            "from": "single_state_input",
            "to": "block_single_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.input_single_state_initializes_block_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_single_state_initializes_block_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "initialize s",
              "connection": {
                "title": "Initialize single rail",
                "role": "first-block single state",
                "inside": "The incoming trunk single representation becomes s_i for the first Pairformer block."
              }
            }
          },
          {
            "id": "projection_46279ec7137b",
            "from": "single_update_stage",
            "to": "single_after_transition",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.single_transition_updates_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_transition_updates_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "attention + transition",
              "connection": {
                "title": "Completed single track",
                "role": "updated single state",
                "inside": "Pair-biased self-attention and a pointwise SwiGLU transition produce s_(i+1)."
              }
            }
          },
          {
            "id": "projection_05b0fbe7575b",
            "from": "token_mask_input",
            "to": "single_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.token_mask_conditions_single_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.token_mask_conditions_single_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_mask"
            ],
            "presentation": {
            }
          }
        ],
        "classifications": {
          "modules.pair_attention_ending_node": "collapsed:modules.pair_update_stage",
          "modules.pair_attention_starting_node": "collapsed:modules.pair_update_stage",
          "modules.pair_transition": "collapsed:modules.pair_update_stage",
          "modules.pair_update_stage": "visible",
          "modules.single_attention_with_pair_bias": "collapsed:modules.single_update_stage",
          "modules.single_pair_logits_projection": "collapsed:modules.single_update_stage",
          "modules.single_transition": "collapsed:modules.single_update_stage",
          "modules.single_update_stage": "visible",
          "modules.triangle_multiplication_incoming": "collapsed:modules.pair_update_stage",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.pair_update_stage",
          "value_sites.block_pair_state": "visible",
          "value_sites.block_single_state": "visible",
          "value_sites.pair_after_ending_attention": "collapsed:modules.pair_update_stage",
          "value_sites.pair_after_incoming_multiplication": "collapsed:modules.pair_update_stage",
          "value_sites.pair_after_outgoing_multiplication": "collapsed:modules.pair_update_stage",
          "value_sites.pair_after_starting_attention": "collapsed:modules.pair_update_stage",
          "value_sites.pair_after_transition": "visible",
          "value_sites.pair_mask_input": "visible",
          "value_sites.pair_state_input": "visible",
          "value_sites.pair_state_output": "visible",
          "value_sites.single_after_pair_attention": "collapsed:modules.single_update_stage",
          "value_sites.single_after_transition": "visible",
          "value_sites.single_pair_attention_logits": "excluded",
          "value_sites.single_state_input": "visible",
          "value_sites.single_state_output": "visible",
          "value_sites.token_mask_input": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "pair_track",
        "title": "Pair Track: Five Ordered Residual Updates",
        "summary": "One 128-channel ordered-pair state passes through outgoing triangle multiplication, incoming triangle multiplication, starting-node attention, ending-node attention, and a 4x SwiGLU transition. Every step adds a delta before the next step reads the state.",
        "parent": "pairformer_block",
        "subject_ref": "modules.pair_update_stage",
        "expansion_depth": 1,
        "grid": {
          "columns": 11,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 24,
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "pair_mask_input",
            "ref": "value_sites.pair_mask_input",
            "label": "pair mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "block_pair_state",
            "ref": "value_sites.block_pair_state",
            "label": "pair state",
            "notation": "z_i",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 3
          },
          {
            "id": "triangle_multiplication_outgoing",
            "ref": "modules.triangle_multiplication_outgoing",
            "label": "outgoing triangle multiplication + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 3
          },
          {
            "id": "pair_after_outgoing_multiplication",
            "ref": "value_sites.pair_after_outgoing_multiplication",
            "label": "outgoing-updated pairs",
            "notation": "z^{out}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 3,
            "row": 3
          },
          {
            "id": "triangle_multiplication_incoming",
            "ref": "modules.triangle_multiplication_incoming",
            "label": "incoming triangle multiplication + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 3
          },
          {
            "id": "pair_after_incoming_multiplication",
            "ref": "value_sites.pair_after_incoming_multiplication",
            "label": "incoming-updated pairs",
            "notation": "z^{in}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 5,
            "row": 3
          },
          {
            "id": "pair_attention_starting_node",
            "ref": "modules.pair_attention_starting_node",
            "label": "starting-node attention + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 3
          },
          {
            "id": "pair_after_starting_attention",
            "ref": "value_sites.pair_after_starting_attention",
            "label": "start-attended pairs",
            "notation": "z^{start}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 7,
            "row": 3
          },
          {
            "id": "pair_attention_ending_node",
            "ref": "modules.pair_attention_ending_node",
            "label": "ending-node attention + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 8,
            "row": 3
          },
          {
            "id": "pair_after_ending_attention",
            "ref": "value_sites.pair_after_ending_attention",
            "label": "end-attended pairs",
            "notation": "z^{end}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 9,
            "row": 3
          },
          {
            "id": "pair_transition",
            "ref": "modules.pair_transition",
            "label": "pair transition + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 10,
            "row": 3
          },
          {
            "id": "pair_after_transition",
            "ref": "value_sites.pair_after_transition",
            "label": "block-output pairs",
            "notation": "z_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 11,
            "row": 3
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.block_pair_state_enters_outgoing_multiplication"
            },
            "label": "z",
            "connection": {
              "title": "Pair state enters outgoing update",
              "role": "ordered-pair input",
              "inside": "The outgoing triangle operation mixes pairs that share their outgoing endpoint pattern."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outgoing_multiplication_updates_pair_state"
            },
            "label": "+ Δz_out",
            "connection": {
              "title": "Outgoing residual update",
              "role": "pair-state mutation",
              "inside": "The gated outgoing triangle result is projected back to 128 channels and added to the incoming pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.incoming_multiplication_updates_pair_state"
            },
            "label": "+ Δz_in",
            "connection": {
              "title": "Incoming residual update",
              "role": "pair-state mutation",
              "inside": "The incoming triangle result is added to the already outgoing-updated pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.starting_attention_updates_pair_state"
            },
            "label": "+ Δz_start",
            "connection": {
              "title": "Starting-node attention update",
              "role": "axial pair attention",
              "inside": "Four-head gated attention follows one axis of the pair grid and adds its projected result."
            }
          },
          {
            "match": {
              "relation_ref": "relations.ending_attention_updates_pair_state"
            },
            "label": "+ Δz_end",
            "connection": {
              "title": "Ending-node attention update",
              "role": "complementary axial pair attention",
              "inside": "The implementation transposes the pair grid, applies the same attention anatomy along the other axis, then transposes back."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_transition_updates_pair_state"
            },
            "label": "+ Δz_ffn",
            "connection": {
              "title": "Pair transition update",
              "role": "pointwise pair feed-forward",
              "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 128-channel delta that is added to each pair entry."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_555ea874e78e",
            "from": "block_pair_state",
            "to": "triangle_multiplication_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.block_pair_state_enters_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_state_enters_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z",
              "connection": {
                "title": "Pair state enters outgoing update",
                "role": "ordered-pair input",
                "inside": "The outgoing triangle operation mixes pairs that share their outgoing endpoint pattern."
              }
            }
          },
          {
            "id": "projection_7943a55a210e",
            "from": "pair_after_ending_attention",
            "to": "pair_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.ending_pair_state_enters_pair_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ending_pair_state_enters_pair_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_6fba0c2b8712",
            "from": "pair_after_incoming_multiplication",
            "to": "pair_attention_starting_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.incoming_pair_state_enters_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.incoming_pair_state_enters_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_8ae44737cd9e",
            "from": "pair_after_outgoing_multiplication",
            "to": "triangle_multiplication_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.outgoing_pair_state_enters_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outgoing_pair_state_enters_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_5b23b86c9092",
            "from": "pair_after_starting_attention",
            "to": "pair_attention_ending_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.starting_pair_state_enters_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.starting_pair_state_enters_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_9e40a3cacd4f",
            "from": "pair_attention_ending_node",
            "to": "pair_after_ending_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.ending_attention_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ending_attention_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_end",
              "connection": {
                "title": "Ending-node attention update",
                "role": "complementary axial pair attention",
                "inside": "The implementation transposes the pair grid, applies the same attention anatomy along the other axis, then transposes back."
              }
            }
          },
          {
            "id": "projection_45b746481b2a",
            "from": "pair_attention_starting_node",
            "to": "pair_after_starting_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.starting_attention_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.starting_attention_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_start",
              "connection": {
                "title": "Starting-node attention update",
                "role": "axial pair attention",
                "inside": "Four-head gated attention follows one axis of the pair grid and adds its projected result."
              }
            }
          },
          {
            "id": "projection_b1d6e2c4f860",
            "from": "pair_mask_input",
            "to": "pair_attention_ending_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_336d3a4cf8de",
            "from": "pair_mask_input",
            "to": "pair_attention_starting_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_6078dc05e461",
            "from": "pair_mask_input",
            "to": "triangle_multiplication_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_3bd720537f77",
            "from": "pair_mask_input",
            "to": "triangle_multiplication_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a4c16e146db3",
            "from": "pair_transition",
            "to": "pair_after_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_ffn",
              "connection": {
                "title": "Pair transition update",
                "role": "pointwise pair feed-forward",
                "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 128-channel delta that is added to each pair entry."
              }
            }
          },
          {
            "id": "projection_3c06742457d1",
            "from": "triangle_multiplication_incoming",
            "to": "pair_after_incoming_multiplication",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.incoming_multiplication_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.incoming_multiplication_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_in",
              "connection": {
                "title": "Incoming residual update",
                "role": "pair-state mutation",
                "inside": "The incoming triangle result is added to the already outgoing-updated pair state."
              }
            }
          },
          {
            "id": "projection_de146f3123a6",
            "from": "triangle_multiplication_outgoing",
            "to": "pair_after_outgoing_multiplication",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.outgoing_multiplication_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outgoing_multiplication_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_out",
              "connection": {
                "title": "Outgoing residual update",
                "role": "pair-state mutation",
                "inside": "The gated outgoing triangle result is projected back to 128 channels and added to the incoming pair state."
              }
            }
          }
        ],
        "classifications": {
          "modules.pair_attention_ending_node": "visible",
          "modules.pair_attention_starting_node": "visible",
          "modules.pair_transition": "visible",
          "modules.triangle_multiplication_incoming": "visible",
          "modules.triangle_multiplication_outgoing": "visible",
          "value_sites.block_pair_state": "visible",
          "value_sites.pair_after_ending_attention": "visible",
          "value_sites.pair_after_incoming_multiplication": "visible",
          "value_sites.pair_after_outgoing_multiplication": "visible",
          "value_sites.pair_after_starting_attention": "visible",
          "value_sites.pair_after_transition": "visible",
          "value_sites.pair_mask_input": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "single_track",
        "title": "Single Track: Pair-Biased Attention Then Transition",
        "summary": "The completed pair state is normalized and projected to 16 attention-head logits. Those logits bias full self-attention over the 384-channel token states; a second residual update comes from a pointwise 4x SwiGLU transition.",
        "parent": "pairformer_block",
        "subject_ref": "modules.single_update_stage",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 30,
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "pair_after_transition",
            "ref": "value_sites.pair_after_transition",
            "label": "updated pairs",
            "notation": "z_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 1
          },
          {
            "id": "single_pair_logits_projection",
            "ref": "modules.single_pair_logits_projection",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 1
          },
          {
            "id": "single_pair_attention_logits",
            "ref": "value_sites.single_pair_attention_logits",
            "label": "pair attention bias",
            "notation": "b",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 1
          },
          {
            "id": "token_mask_input",
            "ref": "value_sites.token_mask_input",
            "label": "token mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 3,
            "row": 2
          },
          {
            "id": "block_single_state",
            "ref": "value_sites.block_single_state",
            "label": "block-input singles",
            "notation": "s_i",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 3
          },
          {
            "id": "single_attention_with_pair_bias",
            "ref": "modules.single_attention_with_pair_bias",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 3
          },
          {
            "id": "single_after_pair_attention",
            "ref": "value_sites.single_after_pair_attention",
            "label": "attention-updated singles",
            "notation": "s^{attn}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "single_transition",
            "ref": "modules.single_transition",
            "label": "single transition + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 3
          },
          {
            "id": "single_after_transition",
            "ref": "value_sites.single_after_transition",
            "label": "block-output singles",
            "notation": "s_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.updated_pair_state_enters_bias_projection"
            },
            "label": "LN(z)",
            "connection": {
              "title": "Normalize updated pairs",
              "role": "bias source",
              "inside": "The pair state is read after all five pair updates and normalized before projection."
            }
          },
          {
            "match": {
              "relation_ref": "relations.bias_projection_produces_pair_logits"
            },
            "label": "Linear 128→16",
            "connection": {
              "title": "Project attention-head logits",
              "role": "pair-to-attention adapter",
              "inside": "Each ordered token pair produces one additive scalar for each of the 16 single-attention heads."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_logits_bias_single_attention"
            },
            "label": "add to logits",
            "tone": "conditioning",
            "connection": {
              "title": "Pair-derived attention bias",
              "role": "pair-to-single information flow",
              "inside": "The projected pair tensor is added to the query-key dot-product logits before softmax; it is not concatenated with single values."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_biased_attention_updates_single_state"
            },
            "label": "+ Δs_attn",
            "connection": {
              "title": "Attention residual update",
              "role": "single-state mutation",
              "inside": "Full 16-head self-attention aggregates token values, applies query gating and an output projection, then the caller adds that delta to s_i."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_transition_updates_single_state"
            },
            "label": "+ Δs_ffn",
            "connection": {
              "title": "Single transition update",
              "role": "pointwise token feed-forward",
              "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 384-channel delta that is added to each token state."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_f3a299d2f0b6",
            "from": "block_single_state",
            "to": "single_attention_with_pair_bias",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.block_single_state_enters_pair_biased_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_state_enters_pair_biased_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_5700ccbaf9eb",
            "from": "pair_after_transition",
            "to": "single_pair_logits_projection",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.updated_pair_state_enters_bias_projection"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_pair_state_enters_bias_projection"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "LN(z)",
              "connection": {
                "title": "Normalize updated pairs",
                "role": "bias source",
                "inside": "The pair state is read after all five pair updates and normalized before projection."
              }
            }
          },
          {
            "id": "projection_ca444202e65a",
            "from": "single_after_pair_attention",
            "to": "single_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.attention_updated_single_enters_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.attention_updated_single_enters_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_c675c08fcfa2",
            "from": "single_attention_with_pair_bias",
            "to": "single_after_pair_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_biased_attention_updates_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_biased_attention_updates_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "+ Δs_attn",
              "connection": {
                "title": "Attention residual update",
                "role": "single-state mutation",
                "inside": "Full 16-head self-attention aggregates token values, applies query gating and an output projection, then the caller adds that delta to s_i."
              }
            }
          },
          {
            "id": "projection_c658550ae8d9",
            "from": "single_pair_attention_logits",
            "to": "single_attention_with_pair_bias",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_logits_bias_single_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_logits_bias_single_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_attention_logits"
            ],
            "presentation": {
              "label": "add to logits",
              "tone": "conditioning",
              "connection": {
                "title": "Pair-derived attention bias",
                "role": "pair-to-single information flow",
                "inside": "The projected pair tensor is added to the query-key dot-product logits before softmax; it is not concatenated with single values."
              }
            }
          },
          {
            "id": "projection_4dd989c65d56",
            "from": "single_pair_logits_projection",
            "to": "single_pair_attention_logits",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.bias_projection_produces_pair_logits"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.bias_projection_produces_pair_logits"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_attention_logits"
            ],
            "presentation": {
              "label": "Linear 128→16",
              "connection": {
                "title": "Project attention-head logits",
                "role": "pair-to-attention adapter",
                "inside": "Each ordered token pair produces one additive scalar for each of the 16 single-attention heads."
              }
            }
          },
          {
            "id": "projection_330f649e6cbd",
            "from": "single_transition",
            "to": "single_after_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.single_transition_updates_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_transition_updates_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "+ Δs_ffn",
              "connection": {
                "title": "Single transition update",
                "role": "pointwise token feed-forward",
                "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 384-channel delta that is added to each token state."
              }
            }
          },
          {
            "id": "projection_c28bd852fab7",
            "from": "token_mask_input",
            "to": "single_attention_with_pair_bias",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.token_mask_conditions_single_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.token_mask_conditions_single_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_mask"
            ],
            "presentation": {
            }
          }
        ],
        "classifications": {
          "modules.single_attention_with_pair_bias": "visible",
          "modules.single_pair_logits_projection": "visible",
          "modules.single_transition": "visible",
          "value_sites.block_single_state": "visible",
          "value_sites.pair_after_transition": "visible",
          "value_sites.single_after_pair_attention": "visible",
          "value_sites.single_after_transition": "visible",
          "value_sites.single_pair_attention_logits": "visible",
          "value_sites.token_mask_input": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "input_feature_embedder_detail",
        "title": "The Input Feature Embedder",
        "summary": "A bare-mode Atom Attention Encoder pools each token's isolated reference-conformer geometry into one per-token vector, which is concatenated with restype, profile, and deletion mean to produce s_inputs -- the single source that the single and pair state projections each read from.",
        "subject_ref": "modules.input_feature_embedder",
        "expansion_depth": 1,
        "grid": {
          "columns": 4,
          "rows": 4,
          "column_sizing": "content"
        },
        "nodes": [
          {
            "id": "value_profile_input",
            "ref": "value_sites.profile_input",
            "label": "MSA profile",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "value_atom_reference_features_input",
            "ref": "value_sites.atom_reference_features_input",
            "label": "reference conformer",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 2
          },
          {
            "id": "value_deletion_mean_input",
            "ref": "value_sites.deletion_mean_input",
            "label": "deletion mean",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 3
          },
          {
            "id": "value_restype_input",
            "ref": "value_sites.restype_input",
            "label": "restype",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 4
          },
          {
            "id": "module_atom_attention_encoder_bare",
            "ref": "modules.atom_attention_encoder_bare",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "module_input_feature_concatenation",
            "ref": "modules.input_feature_concatenation",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2
          },
          {
            "id": "value_s_inputs",
            "ref": "value_sites.s_inputs",
            "label": "input embedding",
            "notation": "s^{inputs}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 2
          }
        ],
        "parent": "pairformer_overview",
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_1574bfd59fa5",
            "from": "module_atom_attention_encoder_bare",
            "to": "module_input_feature_concatenation",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.atom_attention_encoder_feeds_concatenation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.atom_attention_encoder_feeds_concatenation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pooled_atom_encoding"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_ca5c887d6bdf",
            "from": "module_input_feature_concatenation",
            "to": "value_s_inputs",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.concatenation_produces_s_inputs"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.concatenation_produces_s_inputs"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.s_inputs"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_e30cda2ab0bd",
            "from": "value_atom_reference_features_input",
            "to": "module_atom_attention_encoder_bare",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.atom_reference_features_enter_atom_attention_encoder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.atom_reference_features_enter_atom_attention_encoder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.atom_reference_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_9d2f8eabd323",
            "from": "value_deletion_mean_input",
            "to": "module_input_feature_concatenation",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.deletion_mean_enters_concatenation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.deletion_mean_enters_concatenation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.deletion_mean"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_9e54912627a6",
            "from": "value_profile_input",
            "to": "module_input_feature_concatenation",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.profile_enters_concatenation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.profile_enters_concatenation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.profile"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_ba4e8c83ce33",
            "from": "value_restype_input",
            "to": "module_input_feature_concatenation",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.restype_enters_concatenation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.restype_enters_concatenation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.restype"
            ],
            "presentation": {
            }
          }
        ],
        "classifications": {
          "modules.atom_attention_encoder_bare": "visible",
          "modules.input_feature_concatenation": "visible",
          "value_sites.atom_reference_features_input": "visible",
          "value_sites.deletion_mean_input": "visible",
          "value_sites.profile_input": "visible",
          "value_sites.restype_input": "visible",
          "value_sites.s_inputs": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "msa_module_detail",
        "title": "The MSA Module",
        "summary": "Raw per-row MSA features are embedded and anchored to s_inputs, then read into OuterProductMean, which contributes evolutionary coupling (correlated variation across the alignment) into the pair representation before that block's pair-stack runs. MSAPairWeightedAveraging updates the MSA rows using attention weights derived entirely from the pair representation, never from row content. Only the final pair state is returned; the MSA representation itself is discarded.",
        "subject_ref": "modules.msa_module",
        "expansion_depth": 1,
        "parent": "pairformer_overview",
        "grid": {
          "columns": 5,
          "rows": 5,
          "column_sizing": "content",
          "col_gap": 24,
          "row_gap": 26
        },
        "nodes": [
          {
            "id": "value_msa_input",
            "ref": "value_sites.msa_input",
            "label": "MSA identity",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "value_has_deletion_input",
            "ref": "value_sites.has_deletion_input",
            "label": "has deletion",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 2
          },
          {
            "id": "value_deletion_value_input",
            "ref": "value_sites.deletion_value_input",
            "label": "deletion value",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 3
          },
          {
            "id": "value_s_inputs",
            "ref": "value_sites.s_inputs",
            "label": "input embedding",
            "notation": "s^{inputs}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "value_z_init",
            "ref": "value_sites.z_init",
            "label": "initial pairs",
            "notation": "z^{init}",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 5
          },
          {
            "id": "module_msa_row_embedding",
            "ref": "modules.msa_row_embedding",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "module_outer_product_mean",
            "ref": "modules.outer_product_mean",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2,
            "board_ref": "outer_product_mean_detail"
          },
          {
            "id": "value_msa_module_pair_state_read",
            "ref": "value_sites.msa_module_pair_state_read",
            "label": "pairs after communication",
            "notation": "z",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 5
          },
          {
            "id": "module_msa_pair_weighted_averaging",
            "ref": "modules.msa_pair_weighted_averaging",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2,
            "board_ref": "msa_pair_weighted_averaging_detail"
          },
          {
            "id": "module_msa_pair_update_stage",
            "ref": "modules.msa_pair_update_stage",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 5,
            "board_ref": "msa_pair_track"
          },
          {
            "id": "module_msa_transition",
            "ref": "modules.msa_transition",
            "prominence": "primary",
            "treatment": "block",
            "col": 5,
            "row": 2
          },
          {
            "id": "value_pair_state_input",
            "ref": "value_sites.pair_state_input",
            "label": "module output",
            "notation": "z",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 5
          }
        ],
        "elide": [
          {
            "ref": "value_sites.msa_pair_after_transition"
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.s_inputs_enters_msa_row_embedding"
            },
            "label": "s^{inputs}",
            "connection": {
              "title": "Anchor every row to s_inputs",
              "role": "shared row anchor",
              "inside": "The same raw input embedding used everywhere else in AF3 is added identically into every MSA row."
            }
          },
          {
            "match": {
              "relation_ref": "relations.z_init_initializes_msa_module_pair_state"
            },
            "label": "z^{init}",
            "connection": {
              "title": "Pair state enters the block",
              "role": "block-input pair state",
              "inside": "The pair representation arrives here straight from the input projection, before anything else has touched it; the Pairformer only ever sees what this module returns."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outer_product_mean_contribution_updates_msa_module_pair_state"
            },
            "label": "+ Δz_comm",
            "connection": {
              "title": "Communication writes into the pair state",
              "role": "evolutionary-coupling contribution",
              "inside": "OuterProductMean's averaged cross-covariance is added into z before this block's MSA stack or pair-stack read it -- the only place evolutionary coupling enters the pair representation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_state_conditions_msa_pair_weighted_averaging"
            },
            "label": "z",
            "connection": {
              "title": "Pair state conditions MSA attention",
              "role": "pair-derived routing table",
              "inside": "Attention weights come entirely from the pair representation, never from MSA row content, so every row is pulled through the same shared routing table."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.msa_pair_transition_updates_pair_state",
                "relations.msa_module_pair_output_becomes_pair_state_input"
              ]
            },
            "label": "z_{ij}",
            "connection": {
              "title": "Only z_ij is returned",
              "role": "module output",
              "inside": "The MSA representation is discarded every call; only the pair-stack's final state becomes the architecture's pair_state_input."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_3e315d119014",
            "from": "module_msa_pair_update_stage",
            "to": "value_pair_state_input",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.msa_pair_transition_updates_pair_state",
              "relations.msa_module_pair_output_becomes_pair_state_input"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_transition_updates_pair_state"
              },
              {
                "relation_ref": "relations.msa_module_pair_output_becomes_pair_state_input"
              }
            ],
            "hidden_refs": [
              "value_sites.msa_pair_after_transition"
            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z_{ij}",
              "connection": {
                "title": "Only z_ij is returned",
                "role": "module output",
                "inside": "The MSA representation is discarded every call; only the pair-stack's final state becomes the architecture's pair_state_input."
              }
            }
          },
          {
            "id": "projection_b02784aeb729",
            "from": "module_msa_pair_weighted_averaging",
            "to": "module_msa_transition",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.updated_activations_enter_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_activations_enter_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_activations"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_e66d29b3df6e",
            "from": "module_msa_row_embedding",
            "to": "module_msa_pair_weighted_averaging",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_activations_enters_msa_pair_weighted_averaging"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_activations_enters_msa_pair_weighted_averaging"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_activations"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_374fc0c2a94b",
            "from": "module_msa_row_embedding",
            "to": "module_outer_product_mean",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_activations_enters_outer_product_mean"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_activations_enters_outer_product_mean"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_activations"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_dac8b43d993c",
            "from": "module_outer_product_mean",
            "to": "value_msa_module_pair_state_read",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.outer_product_mean_contribution_updates_msa_module_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outer_product_mean_contribution_updates_msa_module_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_comm",
              "connection": {
                "title": "Communication writes into the pair state",
                "role": "evolutionary-coupling contribution",
                "inside": "OuterProductMean's averaged cross-covariance is added into z before this block's MSA stack or pair-stack read it -- the only place evolutionary coupling enters the pair representation."
              }
            }
          },
          {
            "id": "projection_401cbdd1b98e",
            "from": "value_deletion_value_input",
            "to": "module_msa_row_embedding",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.deletion_value_enters_row_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.deletion_value_enters_row_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.deletion_value"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_1a70183d87d1",
            "from": "value_has_deletion_input",
            "to": "module_msa_row_embedding",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.has_deletion_enters_row_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.has_deletion_enters_row_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.has_deletion"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_67e83da3517a",
            "from": "value_msa_input",
            "to": "module_msa_row_embedding",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_input_enters_row_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_input_enters_row_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_identity"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_9d4276033fe2",
            "from": "value_msa_module_pair_state_read",
            "to": "module_msa_pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_pair_state_enters_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_state_enters_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_6a372305a8cd",
            "from": "value_msa_module_pair_state_read",
            "to": "module_msa_pair_weighted_averaging",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_state_conditions_msa_pair_weighted_averaging"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_state_conditions_msa_pair_weighted_averaging"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z",
              "connection": {
                "title": "Pair state conditions MSA attention",
                "role": "pair-derived routing table",
                "inside": "Attention weights come entirely from the pair representation, never from MSA row content, so every row is pulled through the same shared routing table."
              }
            }
          },
          {
            "id": "projection_17c1759edf95",
            "from": "value_s_inputs",
            "to": "module_msa_row_embedding",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.s_inputs_enters_msa_row_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.s_inputs_enters_msa_row_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.s_inputs"
            ],
            "presentation": {
              "label": "s^{inputs}",
              "connection": {
                "title": "Anchor every row to s_inputs",
                "role": "shared row anchor",
                "inside": "The same raw input embedding used everywhere else in AF3 is added identically into every MSA row."
              }
            }
          },
          {
            "id": "projection_9206d2d96c72",
            "from": "value_z_init",
            "to": "value_msa_module_pair_state_read",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.z_init_initializes_msa_module_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.z_init_initializes_msa_module_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z^{init}",
              "connection": {
                "title": "Pair state enters the block",
                "role": "block-input pair state",
                "inside": "The pair representation arrives here straight from the input projection, before anything else has touched it; the Pairformer only ever sees what this module returns."
              }
            }
          }
        ],
        "classifications": {
          "modules.msa_pair_attention_ending_node": "collapsed:modules.msa_pair_update_stage",
          "modules.msa_pair_attention_starting_node": "collapsed:modules.msa_pair_update_stage",
          "modules.msa_pair_transition": "collapsed:modules.msa_pair_update_stage",
          "modules.msa_pair_update_stage": "visible",
          "modules.msa_pair_weighted_averaging": "visible",
          "modules.msa_row_embedding": "visible",
          "modules.msa_transition": "visible",
          "modules.msa_triangle_multiplication_incoming": "collapsed:modules.msa_pair_update_stage",
          "modules.msa_triangle_multiplication_outgoing": "collapsed:modules.msa_pair_update_stage",
          "modules.outer_product_mean": "visible",
          "value_sites.deletion_value_input": "visible",
          "value_sites.has_deletion_input": "visible",
          "value_sites.msa_activations": "collapsed:modules.msa_row_embedding",
          "value_sites.msa_activations_after_pair_weighted_averaging": "collapsed:modules.msa_pair_weighted_averaging",
          "value_sites.msa_activations_after_transition": "collapsed:modules.msa_transition",
          "value_sites.msa_input": "visible",
          "value_sites.msa_module_pair_state_read": "visible",
          "value_sites.msa_pair_after_ending_attention": "collapsed:modules.msa_pair_update_stage",
          "value_sites.msa_pair_after_incoming_multiplication": "collapsed:modules.msa_pair_update_stage",
          "value_sites.msa_pair_after_outgoing_multiplication": "collapsed:modules.msa_pair_update_stage",
          "value_sites.msa_pair_after_starting_attention": "collapsed:modules.msa_pair_update_stage",
          "value_sites.msa_pair_after_transition": "elided",
          "value_sites.msa_pair_weighted_averaging_gate": "collapsed:modules.msa_pair_weighted_averaging",
          "value_sites.msa_pair_weighted_averaging_pair_bias": "collapsed:modules.msa_pair_weighted_averaging",
          "value_sites.msa_pair_weighted_averaging_value": "collapsed:modules.msa_pair_weighted_averaging",
          "value_sites.msa_pair_weighted_averaging_weights": "collapsed:modules.msa_pair_weighted_averaging",
          "value_sites.outer_product_mean_flattened": "collapsed:modules.outer_product_mean",
          "value_sites.outer_product_mean_pair_contribution": "collapsed:modules.outer_product_mean",
          "value_sites.outer_product_mean_projection_a": "collapsed:modules.outer_product_mean",
          "value_sites.outer_product_mean_projection_b": "collapsed:modules.outer_product_mean",
          "value_sites.pair_state_input": "visible",
          "value_sites.s_inputs": "visible",
          "value_sites.z_init": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "msa_pair_track",
        "title": "MSA Module Pair Stack: Five Ordered Residual Updates",
        "summary": "The same five-step pair-stack mechanism as the Pairformer's own pair track (outgoing triangle multiplication, incoming triangle multiplication, starting-node attention, ending-node attention, a 4x SwiGLU transition), with its own parameters, run here 4 times instead of 48. It reads the pair state right after OuterProductMean has written evolutionary coupling into it.",
        "parent": "msa_module_detail",
        "subject_ref": "modules.msa_pair_update_stage",
        "expansion_depth": 1,
        "grid": {
          "columns": 11,
          "rows": 3,
          "column_sizing": "content",
          "col_gap": 24,
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "msa_module_pair_state_read",
            "ref": "value_sites.msa_module_pair_state_read",
            "label": "pairs after communication",
            "notation": "z",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "msa_triangle_multiplication_outgoing",
            "ref": "modules.msa_triangle_multiplication_outgoing",
            "label": "outgoing triangle multiplication + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2
          },
          {
            "id": "msa_pair_after_outgoing_multiplication",
            "ref": "value_sites.msa_pair_after_outgoing_multiplication",
            "label": "outgoing-updated pairs",
            "notation": "z^{out}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 3,
            "row": 2
          },
          {
            "id": "msa_triangle_multiplication_incoming",
            "ref": "modules.msa_triangle_multiplication_incoming",
            "label": "incoming triangle multiplication + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 2
          },
          {
            "id": "msa_pair_after_incoming_multiplication",
            "ref": "value_sites.msa_pair_after_incoming_multiplication",
            "label": "incoming-updated pairs",
            "notation": "z^{in}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 5,
            "row": 2
          },
          {
            "id": "msa_pair_attention_starting_node",
            "ref": "modules.msa_pair_attention_starting_node",
            "label": "starting-node attention + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 2
          },
          {
            "id": "msa_pair_after_starting_attention",
            "ref": "value_sites.msa_pair_after_starting_attention",
            "label": "start-attended pairs",
            "notation": "z^{start}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 7,
            "row": 2
          },
          {
            "id": "msa_pair_attention_ending_node",
            "ref": "modules.msa_pair_attention_ending_node",
            "label": "ending-node attention + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 8,
            "row": 2
          },
          {
            "id": "msa_pair_after_ending_attention",
            "ref": "value_sites.msa_pair_after_ending_attention",
            "label": "end-attended pairs",
            "notation": "z^{end}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 9,
            "row": 2
          },
          {
            "id": "msa_pair_transition",
            "ref": "modules.msa_pair_transition",
            "label": "pair transition + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 10,
            "row": 2
          },
          {
            "id": "msa_pair_after_transition",
            "ref": "value_sites.msa_pair_after_transition",
            "label": "pair-stack output",
            "notation": "z_{ij}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 11,
            "row": 2
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.msa_pair_state_enters_outgoing_multiplication"
            },
            "label": "z",
            "connection": {
              "title": "Pair state enters outgoing update",
              "role": "ordered-pair input",
              "inside": "The outgoing triangle operation mixes pairs that share their outgoing endpoint pattern, reading the same z that communication just wrote into."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_outgoing_multiplication_updates_pair_state"
            },
            "label": "+ Δz_out",
            "connection": {
              "title": "Outgoing residual update",
              "role": "pair-state mutation",
              "inside": "The gated outgoing triangle result is projected back to 128 channels and added to the incoming pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_incoming_multiplication_updates_pair_state"
            },
            "label": "+ Δz_in",
            "connection": {
              "title": "Incoming residual update",
              "role": "pair-state mutation",
              "inside": "The incoming triangle result is added to the already outgoing-updated pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_starting_attention_updates_pair_state"
            },
            "label": "+ Δz_start",
            "connection": {
              "title": "Starting-node attention update",
              "role": "axial pair attention",
              "inside": "Four-head gated attention follows one axis of the pair grid and adds its projected result."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_ending_attention_updates_pair_state"
            },
            "label": "+ Δz_end",
            "connection": {
              "title": "Ending-node attention update",
              "role": "complementary axial pair attention",
              "inside": "The implementation transposes the pair grid, applies the same attention anatomy along the other axis, then transposes back."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_pair_transition_updates_pair_state"
            },
            "label": "+ Δz_ffn",
            "connection": {
              "title": "Pair transition update",
              "role": "pointwise pair feed-forward",
              "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 128-channel delta that is added to each pair entry; the result is this module's own returned z_ij."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_b1349e8418c0",
            "from": "msa_module_pair_state_read",
            "to": "msa_triangle_multiplication_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_pair_state_enters_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_state_enters_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z",
              "connection": {
                "title": "Pair state enters outgoing update",
                "role": "ordered-pair input",
                "inside": "The outgoing triangle operation mixes pairs that share their outgoing endpoint pattern, reading the same z that communication just wrote into."
              }
            }
          },
          {
            "id": "projection_383f6f10204d",
            "from": "msa_pair_after_ending_attention",
            "to": "msa_pair_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_ending_pair_state_enters_pair_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_ending_pair_state_enters_pair_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_75930e2b182c",
            "from": "msa_pair_after_incoming_multiplication",
            "to": "msa_pair_attention_starting_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_incoming_pair_state_enters_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_incoming_pair_state_enters_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_52f5c2ef63c8",
            "from": "msa_pair_after_outgoing_multiplication",
            "to": "msa_triangle_multiplication_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_outgoing_pair_state_enters_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_outgoing_pair_state_enters_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_c08eae30239d",
            "from": "msa_pair_after_starting_attention",
            "to": "msa_pair_attention_ending_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_starting_pair_state_enters_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_starting_pair_state_enters_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_4c06272b2bee",
            "from": "msa_pair_attention_ending_node",
            "to": "msa_pair_after_ending_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.msa_ending_attention_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_ending_attention_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_end",
              "connection": {
                "title": "Ending-node attention update",
                "role": "complementary axial pair attention",
                "inside": "The implementation transposes the pair grid, applies the same attention anatomy along the other axis, then transposes back."
              }
            }
          },
          {
            "id": "projection_a7b10a7b4004",
            "from": "msa_pair_attention_starting_node",
            "to": "msa_pair_after_starting_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.msa_starting_attention_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_starting_attention_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_start",
              "connection": {
                "title": "Starting-node attention update",
                "role": "axial pair attention",
                "inside": "Four-head gated attention follows one axis of the pair grid and adds its projected result."
              }
            }
          },
          {
            "id": "projection_b6654d566d61",
            "from": "msa_pair_transition",
            "to": "msa_pair_after_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.msa_pair_transition_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_transition_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_ffn",
              "connection": {
                "title": "Pair transition update",
                "role": "pointwise pair feed-forward",
                "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 128-channel delta that is added to each pair entry; the result is this module's own returned z_ij."
              }
            }
          },
          {
            "id": "projection_8b7d55ba772d",
            "from": "msa_triangle_multiplication_incoming",
            "to": "msa_pair_after_incoming_multiplication",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.msa_incoming_multiplication_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_incoming_multiplication_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_in",
              "connection": {
                "title": "Incoming residual update",
                "role": "pair-state mutation",
                "inside": "The incoming triangle result is added to the already outgoing-updated pair state."
              }
            }
          },
          {
            "id": "projection_6aa5d8a1837b",
            "from": "msa_triangle_multiplication_outgoing",
            "to": "msa_pair_after_outgoing_multiplication",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.msa_outgoing_multiplication_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_outgoing_multiplication_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_out",
              "connection": {
                "title": "Outgoing residual update",
                "role": "pair-state mutation",
                "inside": "The gated outgoing triangle result is projected back to 128 channels and added to the incoming pair state."
              }
            }
          }
        ],
        "classifications": {
          "modules.msa_pair_attention_ending_node": "visible",
          "modules.msa_pair_attention_starting_node": "visible",
          "modules.msa_pair_transition": "visible",
          "modules.msa_triangle_multiplication_incoming": "visible",
          "modules.msa_triangle_multiplication_outgoing": "visible",
          "value_sites.msa_module_pair_state_read": "visible",
          "value_sites.msa_pair_after_ending_attention": "visible",
          "value_sites.msa_pair_after_incoming_multiplication": "visible",
          "value_sites.msa_pair_after_outgoing_multiplication": "visible",
          "value_sites.msa_pair_after_starting_attention": "visible",
          "value_sites.msa_pair_after_transition": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "outer_product_mean_detail",
        "title": "Outer Product Mean: Evolutionary Coupling, Made Architectural",
        "summary": "For every token pair, OuterProductMean projects each MSA row's activations into two independent 32-channel factors, forms their outer product, and averages that product over every row in the alignment -- an empirical cross-covariance between two learned features, observed across the MSA's sequences, the same statistic classical coevolution-based contact prediction computes by hand. A final biased Linear layer compresses the flattened 1024-channel result into the pair representation's 128 channels.",
        "parent": "msa_module_detail",
        "subject_ref": "modules.outer_product_mean",
        "expansion_depth": 1,
        "grid": {
          "columns": 6,
          "rows": 3,
          "column_sizing": "content",
          "col_gap": 26,
          "row_gap": 24
        },
        "nodes": [
          {
            "id": "value_msa_activations",
            "ref": "value_sites.msa_activations",
            "label": "MSA activations",
            "notation": "m_{si}",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "outer_product_mean",
            "ref": "modules.outer_product_mean",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "value_outer_product_mean_projection_a",
            "ref": "value_sites.outer_product_mean_projection_a",
            "label": "left factor",
            "notation": "a_{si}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 1
          },
          {
            "id": "value_outer_product_mean_projection_b",
            "ref": "value_sites.outer_product_mean_projection_b",
            "label": "right factor",
            "notation": "b_{sj}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 3
          },
          {
            "id": "value_outer_product_mean_flattened",
            "ref": "value_sites.outer_product_mean_flattened",
            "label": "mean outer product, flattened",
            "notation": "o_{ij}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 2
          },
          {
            "id": "value_outer_product_mean_pair_contribution",
            "ref": "value_sites.outer_product_mean_pair_contribution",
            "label": "pair contribution",
            "notation": "z^{comm}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "value_msa_module_pair_state_read",
            "ref": "value_sites.msa_module_pair_state_read",
            "label": "pairs after communication",
            "notation": "z",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 2
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.msa_activations_enters_outer_product_mean"
            },
            "label": "m_{si}",
            "connection": {
              "title": "MSA activations enter communication",
              "role": "shared per-block read",
              "inside": "OuterProductMean reads the same LayerNorm'd MSA activations that MSAPairWeightedAveraging separately reads later in this block."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outer_product_mean_produces_projection_a"
            },
            "label": "a_{si}",
            "connection": {
              "title": "Left factor",
              "role": "outer-product left factor",
              "inside": "One of two independent LinearNoBias projections down to 32 channels, evaluated at token i."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outer_product_mean_produces_projection_b"
            },
            "label": "b_{sj}",
            "connection": {
              "title": "Right factor",
              "role": "outer-product right factor",
              "inside": "A second, independently learned LinearNoBias projection down to 32 channels, evaluated at token j -- the asymmetry (a at i, b at j, same row) is what makes the outer product a genuine cross-position statistic rather than a self-statistic."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outer_product_mean_produces_flattened_outer_product"
            },
            "label": "o_{ij}",
            "connection": {
              "title": "Cross-covariance across the alignment",
              "role": "empirical cross-covariance",
              "inside": "For every token pair, the 32x32 outer product of a_si and b_sj is averaged over every MSA row and flattened to 1024 channels -- structurally an empirical covariance between two learned features, observed across the alignment's sequences."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outer_product_mean_produces_pair_contribution"
            },
            "label": "z^{comm}",
            "connection": {
              "title": "Compress to pair width",
              "role": "biased pair-channel compression",
              "inside": "One Linear layer with a bias term (the sole exception to LinearNoBias in this mechanism) compresses the 1024-channel summary down to the pair representation's 128 channels."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outer_product_mean_contribution_updates_msa_module_pair_state"
            },
            "label": "+ Δz_comm",
            "connection": {
              "title": "Communication writes into the pair state",
              "role": "evolutionary-coupling contribution",
              "inside": "This contribution is added into z before this block's MSA stack or pair-stack read it -- the only place evolutionary coupling enters the pair representation anywhere in the model."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_eb8dbc3a06a7",
            "from": "outer_product_mean",
            "to": "value_outer_product_mean_flattened",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.outer_product_mean_produces_flattened_outer_product"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outer_product_mean_produces_flattened_outer_product"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.outer_product_mean_flattened"
            ],
            "presentation": {
              "label": "o_{ij}",
              "connection": {
                "title": "Cross-covariance across the alignment",
                "role": "empirical cross-covariance",
                "inside": "For every token pair, the 32x32 outer product of a_si and b_sj is averaged over every MSA row and flattened to 1024 channels -- structurally an empirical covariance between two learned features, observed across the alignment's sequences."
              }
            }
          },
          {
            "id": "projection_7710fd8e66d4",
            "from": "outer_product_mean",
            "to": "value_outer_product_mean_pair_contribution",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.outer_product_mean_produces_pair_contribution"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outer_product_mean_produces_pair_contribution"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z^{comm}",
              "connection": {
                "title": "Compress to pair width",
                "role": "biased pair-channel compression",
                "inside": "One Linear layer with a bias term (the sole exception to LinearNoBias in this mechanism) compresses the 1024-channel summary down to the pair representation's 128 channels."
              }
            }
          },
          {
            "id": "projection_6393fa08a216",
            "from": "outer_product_mean",
            "to": "value_outer_product_mean_projection_a",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.outer_product_mean_produces_projection_a"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outer_product_mean_produces_projection_a"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.outer_product_mean_projection_a"
            ],
            "presentation": {
              "label": "a_{si}",
              "connection": {
                "title": "Left factor",
                "role": "outer-product left factor",
                "inside": "One of two independent LinearNoBias projections down to 32 channels, evaluated at token i."
              }
            }
          },
          {
            "id": "projection_4f122139429f",
            "from": "outer_product_mean",
            "to": "value_outer_product_mean_projection_b",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.outer_product_mean_produces_projection_b"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outer_product_mean_produces_projection_b"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.outer_product_mean_projection_b"
            ],
            "presentation": {
              "label": "b_{sj}",
              "connection": {
                "title": "Right factor",
                "role": "outer-product right factor",
                "inside": "A second, independently learned LinearNoBias projection down to 32 channels, evaluated at token j -- the asymmetry (a at i, b at j, same row) is what makes the outer product a genuine cross-position statistic rather than a self-statistic."
              }
            }
          },
          {
            "id": "projection_2d097c2a8274",
            "from": "value_msa_activations",
            "to": "outer_product_mean",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_activations_enters_outer_product_mean"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_activations_enters_outer_product_mean"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_activations"
            ],
            "presentation": {
              "label": "m_{si}",
              "connection": {
                "title": "MSA activations enter communication",
                "role": "shared per-block read",
                "inside": "OuterProductMean reads the same LayerNorm'd MSA activations that MSAPairWeightedAveraging separately reads later in this block."
              }
            }
          },
          {
            "id": "projection_89c932f1a9c9",
            "from": "value_outer_product_mean_pair_contribution",
            "to": "value_msa_module_pair_state_read",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.outer_product_mean_contribution_updates_msa_module_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outer_product_mean_contribution_updates_msa_module_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_comm",
              "connection": {
                "title": "Communication writes into the pair state",
                "role": "evolutionary-coupling contribution",
                "inside": "This contribution is added into z before this block's MSA stack or pair-stack read it -- the only place evolutionary coupling enters the pair representation anywhere in the model."
              }
            }
          }
        ],
        "classifications": {
          "modules.outer_product_mean": "visible",
          "value_sites.msa_activations": "visible",
          "value_sites.msa_module_pair_state_read": "visible",
          "value_sites.outer_product_mean_flattened": "visible",
          "value_sites.outer_product_mean_pair_contribution": "visible",
          "value_sites.outer_product_mean_projection_a": "visible",
          "value_sites.outer_product_mean_projection_b": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "msa_pair_weighted_averaging_detail",
        "title": "MSA Pair Weighted Averaging: Attention With the Query Removed",
        "summary": "MSAPairWeightedAveraging is standard multi-head attention with the query deleted -- its weights come entirely from the pair representation z_ij, never from MSA row content, so every one of the alignment's rows is pulled through the exact same shared routing table. Each row only supplies what value to fetch and, after the fact via a per-row sigmoid gate, how much of the shared result to trust.",
        "parent": "msa_module_detail",
        "subject_ref": "modules.msa_pair_weighted_averaging",
        "expansion_depth": 1,
        "grid": {
          "columns": 5,
          "rows": 5,
          "column_sizing": "content",
          "col_gap": 26,
          "row_gap": 22
        },
        "nodes": [
          {
            "id": "value_msa_module_pair_state_read_pwa",
            "ref": "value_sites.msa_module_pair_state_read",
            "label": "pairs after communication",
            "notation": "z",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "value_msa_activations_pwa",
            "ref": "value_sites.msa_activations",
            "label": "MSA activations",
            "notation": "m_{si}",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "msa_pair_weighted_averaging",
            "ref": "modules.msa_pair_weighted_averaging",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 3
          },
          {
            "id": "value_msa_pair_weighted_averaging_pair_bias",
            "ref": "value_sites.msa_pair_weighted_averaging_pair_bias",
            "label": "pair-derived logit",
            "notation": "b_{ij}^{h}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 1
          },
          {
            "id": "value_msa_pair_weighted_averaging_weights",
            "ref": "value_sites.msa_pair_weighted_averaging_weights",
            "label": "shared attention weights",
            "notation": "w_{ij}^{h}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 1
          },
          {
            "id": "value_msa_pair_weighted_averaging_value",
            "ref": "value_sites.msa_pair_weighted_averaging_value",
            "label": "per-row value",
            "notation": "v_{si}^{h}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 5
          },
          {
            "id": "value_msa_pair_weighted_averaging_gate",
            "ref": "value_sites.msa_pair_weighted_averaging_gate",
            "label": "per-row gate",
            "notation": "g_{si}^{h}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 5
          },
          {
            "id": "value_msa_activations_after_pair_weighted_averaging",
            "ref": "value_sites.msa_activations_after_pair_weighted_averaging",
            "label": "updated MSA rows",
            "notation": "m_{si}^{updated}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          }
        ],
        "exclude": [
          {
            "ref": "modules.msa_transition",
            "reason": "MSA Transition is a separate step of the MSA stack, already shown on the parent MSA Module board; not part of MSAPairWeightedAveraging's own internals."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.pair_state_conditions_msa_pair_weighted_averaging"
            },
            "label": "z",
            "connection": {
              "title": "Pair state conditions attention",
              "role": "pair-derived routing input",
              "inside": "The only route into this module that never touches MSA row content -- attention weights are derived from z_ij alone."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_pair_weighted_averaging_produces_pair_bias"
            },
            "label": "b_{ij}^{h}",
            "connection": {
              "title": "Pair-derived logit, no row axis",
              "role": "per-head attention logit",
              "inside": "One LinearNoBias projection of the LayerNorm'd pair representation, computed once per token pair per block -- there is no MSA-row index anywhere in this computation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_pair_weighted_averaging_produces_attention_weights"
            },
            "label": "w_{ij}^{h}",
            "connection": {
              "title": "Softmax over the key axis, still row-free",
              "role": "shared attention weights",
              "inside": "b_ij^h softmax-normalized over token j. Still derived purely from z_ij, so this exact same weight table is applied to every one of the N_msa rows -- the crux fact this mechanism exists to teach."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_activations_enters_msa_pair_weighted_averaging"
            },
            "label": "m_{si}",
            "connection": {
              "title": "MSA activations enter the value and gate paths",
              "role": "row-content input",
              "inside": "The only two projections in this module that ever read row content -- the value projection and the gate below."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_pair_weighted_averaging_produces_value"
            },
            "label": "v_{si}^{h}",
            "connection": {
              "title": "Row-specific value",
              "role": "per-row attended content",
              "inside": "The row content the shared, pair-derived weights get applied to -- every row supplies its own values, but none of them influence which weights are used."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_pair_weighted_averaging_produces_gate"
            },
            "label": "g_{si}^{h}",
            "connection": {
              "title": "The one per-row control point",
              "role": "per-row sigmoid gate",
              "inside": "Computed from the row's own activation and applied after the weighted average, not before -- the only place in this mechanism where a row can influence its own output, since the routing table itself is identical for every row."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_pair_weighted_averaging_produces_updated_activations"
            },
            "label": "gated, projected, + residual",
            "connection": {
              "title": "Combine, project, and write back",
              "role": "module output",
              "inside": "Row s's gate multiplies that row's own weighted average of values (using the shared weights above), a LinearNoBias layer concatenates and projects across heads, and the result is added back into that row's MSA activations."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_8902558c94d8",
            "from": "msa_pair_weighted_averaging",
            "to": "value_msa_activations_after_pair_weighted_averaging",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.msa_pair_weighted_averaging_produces_updated_activations"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_weighted_averaging_produces_updated_activations"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_activations"
            ],
            "presentation": {
              "label": "gated, projected, + residual",
              "connection": {
                "title": "Combine, project, and write back",
                "role": "module output",
                "inside": "Row s's gate multiplies that row's own weighted average of values (using the shared weights above), a LinearNoBias layer concatenates and projects across heads, and the result is added back into that row's MSA activations."
              }
            }
          },
          {
            "id": "projection_6cde61840ce8",
            "from": "msa_pair_weighted_averaging",
            "to": "value_msa_pair_weighted_averaging_gate",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_pair_weighted_averaging_produces_gate"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_weighted_averaging_produces_gate"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_pair_weighted_averaging_gate"
            ],
            "presentation": {
              "label": "g_{si}^{h}",
              "connection": {
                "title": "The one per-row control point",
                "role": "per-row sigmoid gate",
                "inside": "Computed from the row's own activation and applied after the weighted average, not before -- the only place in this mechanism where a row can influence its own output, since the routing table itself is identical for every row."
              }
            }
          },
          {
            "id": "projection_d7ca2ad57728",
            "from": "msa_pair_weighted_averaging",
            "to": "value_msa_pair_weighted_averaging_pair_bias",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_pair_weighted_averaging_produces_pair_bias"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_weighted_averaging_produces_pair_bias"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_pair_weighted_averaging_pair_bias"
            ],
            "presentation": {
              "label": "b_{ij}^{h}",
              "connection": {
                "title": "Pair-derived logit, no row axis",
                "role": "per-head attention logit",
                "inside": "One LinearNoBias projection of the LayerNorm'd pair representation, computed once per token pair per block -- there is no MSA-row index anywhere in this computation."
              }
            }
          },
          {
            "id": "projection_5f365c35bdd2",
            "from": "msa_pair_weighted_averaging",
            "to": "value_msa_pair_weighted_averaging_value",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_pair_weighted_averaging_produces_value"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_weighted_averaging_produces_value"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_pair_weighted_averaging_value"
            ],
            "presentation": {
              "label": "v_{si}^{h}",
              "connection": {
                "title": "Row-specific value",
                "role": "per-row attended content",
                "inside": "The row content the shared, pair-derived weights get applied to -- every row supplies its own values, but none of them influence which weights are used."
              }
            }
          },
          {
            "id": "projection_3031baa3c29a",
            "from": "msa_pair_weighted_averaging",
            "to": "value_msa_pair_weighted_averaging_weights",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_pair_weighted_averaging_produces_attention_weights"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_pair_weighted_averaging_produces_attention_weights"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_pair_weighted_averaging_weights"
            ],
            "presentation": {
              "label": "w_{ij}^{h}",
              "connection": {
                "title": "Softmax over the key axis, still row-free",
                "role": "shared attention weights",
                "inside": "b_ij^h softmax-normalized over token j. Still derived purely from z_ij, so this exact same weight table is applied to every one of the N_msa rows -- the crux fact this mechanism exists to teach."
              }
            }
          },
          {
            "id": "projection_79af10638584",
            "from": "value_msa_activations_pwa",
            "to": "msa_pair_weighted_averaging",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_activations_enters_msa_pair_weighted_averaging"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_activations_enters_msa_pair_weighted_averaging"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_activations"
            ],
            "presentation": {
              "label": "m_{si}",
              "connection": {
                "title": "MSA activations enter the value and gate paths",
                "role": "row-content input",
                "inside": "The only two projections in this module that ever read row content -- the value projection and the gate below."
              }
            }
          },
          {
            "id": "projection_7ef38fc6633e",
            "from": "value_msa_module_pair_state_read_pwa",
            "to": "msa_pair_weighted_averaging",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_state_conditions_msa_pair_weighted_averaging"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_state_conditions_msa_pair_weighted_averaging"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z",
              "connection": {
                "title": "Pair state conditions attention",
                "role": "pair-derived routing input",
                "inside": "The only route into this module that never touches MSA row content -- attention weights are derived from z_ij alone."
              }
            }
          }
        ],
        "classifications": {
          "modules.msa_pair_weighted_averaging": "visible",
          "modules.msa_transition": "excluded",
          "value_sites.msa_activations": "visible",
          "value_sites.msa_activations_after_pair_weighted_averaging": "visible",
          "value_sites.msa_activations_after_transition": "excluded",
          "value_sites.msa_module_pair_state_read": "visible",
          "value_sites.msa_pair_weighted_averaging_gate": "visible",
          "value_sites.msa_pair_weighted_averaging_pair_bias": "visible",
          "value_sites.msa_pair_weighted_averaging_value": "visible",
          "value_sites.msa_pair_weighted_averaging_weights": "visible"
        },
        "projectionMode": "derived"
      }
    ]
  }
};
