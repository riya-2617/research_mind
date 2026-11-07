import pymupdf as fitz
from pathlib import Path
from typing import List, Dict, Any, Optional
import uuid
import re
from app.config import SAMPLE_DIR, UPLOAD_DIR

PAPERS_SPEC = [
    {
        "id": "attention",
        "filename": "Attention_Is_All_You_Need.pdf",
        "title": "Attention Is All You Need",
        "authors": "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin",
        "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & Motivation", "Recurrent neural networks, long short-term memory (LSTM) and gated recurrent units (GRU) have been firmly established as state of the art approaches in sequence transduction problems such as machine translation. Recurrent models factor computation along symbol positions. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths. In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on self-attention mechanisms to compute representations of its input and output without using sequence-aligned RNNs or convolution."),
                    ("2. Background & Related Architectural Paradigms", "The goal of reducing sequential computation forms the foundation of Extended Neural GPU, ByteNet and ConvS2S, which use convolutional networks. In these models, the number of operations required to relate signals from two arbitrary positions grows with distance: linearly for ConvS2S and logarithmically for ByteNet. In the Transformer, this is reduced to a constant number of operations O(1) via multi-head self-attention.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Model Architecture & Scaled Dot-Product Attention", "The Transformer follows an encoder-decoder architecture using stacked self-attention and point-wise, fully connected layers. The encoder is composed of N = 6 identical layers, each with multi-head self-attention followed by a position-wise feed-forward network with residual connections and layer normalization: Output = LayerNorm(x + Sublayer(x)).\nScaled Dot-Product Attention is computed as: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V, where queries and keys have dimension d_k = 64, and values have dimension d_v = 64. Scaling by 1 / sqrt(d_k) counteracts large magnitude dot products that push the softmax function into regions with dangerously small gradients."),
                    ("3.1 Multi-Head Attention Dynamics", "Instead of performing a single attention function with d_model-dimensional keys, values, and queries, we project the queries, keys, and values h = 8 times with different, learned linear projections to d_k, d_k, and d_v dimensions respectively: MultiHead(Q,K,V) = Concat(head_1, ..., head_h) * W^O. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Experimental Results and Translation Benchmarks", "On the WMT 2014 English-to-German translation task, the Transformer (Big) model achieves 28.4 BLEU, outperforming existing models and ensembles by >2.0 BLEU with an efficiency of 2.3 x 10^19 FLOPs. On WMT 2014 English-to-French, our model establishes 41.8 BLEU with training time of 3.5 days on 8 NVIDIA P100 GPUs."),
                    ("5. Critical Limitations and Quadratic Scaling Constraints", "Despite empirical dominance, self-attention suffers from fundamental algorithmic boundaries. First, memory and computational complexity scale quadratically O(n^2) with sequence length n. This severely bounds context windows on long texts and genomic sequences. Second, lack of recurrence requires absolute or learned positional encodings, which exhibit poor out-of-distribution length generalization on unseen token distances."),
                    ("6. Open Questions & Future Research Trajectories", "Research is critically needed to design sub-quadratic or linear attention mechanisms (such as state-space models and kernelized projections) and to extend attention mechanics natively to non-textual modalities without token fragmentation.")
                ]
            }
        ]
    },
    {
        "id": "lora",
        "filename": "LoRA_Low_Rank_Adaptation.pdf",
        "title": "LoRA: Low-Rank Adaptation of Large Language Models",
        "authors": "Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen",
        "abstract": "An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks or domains. As we pre-train larger models, full fine-tuning, which retrains all model parameters, becomes less feasible. Using GPT-3 175B as an example - deploying independent instances of fine-tuned models, each with 175B parameters, is prohibitively expensive. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks. Compared to fine-tuning GPT-3 175B with Adam, LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times. LoRA performs on-par or better than fine-tuning in model quality on RoBERTa, DeBERTa, GPT-2, and GPT-3, despite having fewer trainable parameters.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & Storage Bottleneck in Scale", "Modern NLP relies on pre-training foundational language models and adapting them to specialized downstream tasks. Conventional adaptation updates all parameters (full fine-tuning). For massive architectures like GPT-3 (175 billion parameters), storing and serving distinct checkpoints requires 350 GB of VRAM per fine-tuned instance, creating extreme operational deployment barriers. We draw on intrinsic dimensionality theory, which asserts that over-parametrized neural models reside on a low intrinsic manifold during task adaptation."),
                    ("2. Mathematical Formulation of Low-Rank Decomposition", "For a pre-trained weight matrix W_0 in R^(d x k), we constrain its weight update Delta W by representing it through low-rank decomposition: W = W_0 + Delta W = W_0 + (alpha / r) * (B * A), where B in R^(d x r), A in R^(r x k), with rank r << min(d, k). Matrix A is initialized from a Gaussian distribution N(0, sigma^2) while B is initialized to zero, ensuring Delta W = 0 at the start of adaptation. The scaling factor alpha / r stabilizes optimization across variable rank choices.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Algorithmic Advantages & Zero Deployment Latency", "LoRA provides three key engineering benefits:\n1. Memory Efficiency: Optimizer states for frozen weights W_0 are omitted from memory, reducing VRAM footprint by up to 3x.\n2. Modular Checkpoints: Adapter weights (matrices A and B) occupy mere megabytes (e.g., 20 MB vs 350 GB for GPT-3).\n3. Zero Inference Latency: In production deployment, we directly merge weights via W_merged = W_0 + (alpha / r) * (B * A), recovering identical inference latency with zero architectural branching overhead during single-task serving.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Quantitative Benchmarks Across Language Models", "On GLUE benchmarks using RoBERTa-large and DeBERTa-XXL, LoRA matches or exceeds full fine-tuning accuracy while updating only 0.08% of parameters. On GPT-3 175B, LoRA attains 73.4% on WikiSQL and 65.8 BLEU on E2E NLG, surpassing prefix tuning and series adapters."),
                    ("5. Limitations and Deployment Vulnerabilities", "LoRA exhibits specific constraints: Multi-tenant serving of mixed tasks in a single batched inference call incurs computational overhead because dynamically swapping weight matrices W = W_0 + B_i * A_i per batch element requires custom kernel dispatch. Additionally, determining optimal rank r per projection layer (W_q, W_k, W_v, W_o) currently relies on empirical grid search."),
                    ("6. Future Work: Adaptive Rank Search & Quantized LoRA", "Open questions include automated layer-wise rank allocation, theoretical convergence bounds under non-convex objectives, and unifying LoRA with aggressive 4-bit NormalFloat weight quantization (QLoRA).")
                ]
            }
        ]
    },
    {
        "id": "flashattention",
        "filename": "FlashAttention_IO_Aware_Attention.pdf",
        "title": "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
        "authors": "Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré",
        "abstract": "Transformers are slow and memory-hungry on long sequences, since the time and memory complexity of self-attention are quadratic in sequence length. Approximate attention methods have attempted to address this compute and memory bottleneck by trading off model quality to achieve speedup, but often fail to achieve real-wallclock speedup. We argue that a missing principle is making attention algorithms IO-aware—accounting for reads and writes between levels of GPU memory (such as High Bandwidth Memory HBM and fast on-chip SRAM). We propose FlashAttention, an IO-aware exact attention algorithm that uses tiling to reduce the number of memory reads/writes between GPU HBM and SRAM. We analyze the IO complexity of FlashAttention, proving that it requires fewer HBM accesses than standard attention. FlashAttention trains Transformers 2-4x faster than standard PyTorch attention, scales linearly in sequence length memory footprint, and enables training on sequences up to 64k tokens.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & The IO Bottleneck Principle", "Standard attention implementations in PyTorch materialize the full intermediate N x N attention matrix S = Q * K^T and attention probability matrix P = softmax(S) in GPU High Bandwidth Memory (HBM). Modern GPUs (such as NVIDIA A100) are memory-bandwidth-bound rather than compute-bound for attention: SRAM bandwidth is ~19 TB/s while HBM bandwidth is only ~1.5 TB/s. Materializing large N x N matrices in slow HBM dominates execution time, leading to memory-bound latency."),
                    ("2. Hardware Foundations: The GPU Memory Hierarchy", "To accelerate attention, algorithms must minimize reads and writes between slow HBM (40-80 GB) and small, fast on-chip SRAM (192 KB per Streaming Multiprocessor). Theoretical FLOP reductions that ignore memory IO (such as sparse or low-rank attention) often yield zero practical wall-clock speedup due to memory transfer overhead.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. FlashAttention Algorithm: Tiling and Online Softmax", "FlashAttention computes exact attention using two synergistic techniques:\n1. Tiling: We partition inputs Q, K, V into blocks that fit within SRAM. We evaluate softmax iteratively across blocks using the online softmax formulation, maintaining running normalization statistics (m_i, l_i) without materializing the full N x N matrix in HBM.\n2. Recomputation: In the backward pass, rather than reading saved N x N attention matrices from slow HBM, FlashAttention recomputes attention blocks directly in fast SRAM using stored forward normalization statistics. This converts slow memory IO into fast arithmetic compute.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. IO Complexity & End-to-End Speedups", "FlashAttention requires O(N^2 * d^2 / M) HBM accesses where M is SRAM capacity, compared to standard attention which requires Theta(N * d + N^2) HBM accesses—a 4x to 9x reduction in HBM traffic. Empirically, FlashAttention trains BERT-large 2.4x faster, GPT-2 3x faster, and solves the Long Range Arena Path-X 16k benchmark with 86.4% accuracy where standard attention runs out of memory."),
                    ("5. Hardware Constraints & Algorithmic Limitations", "FlashAttention kernels require low-level CUDA and warp-level primitives tuned for specific GPU microarchitectures (SRAM sizes, warp shuffles). Execution on non-NVIDIA accelerators or CPU clusters requires ground-up kernel rewriting. Furthermore, for sequence lengths > 100k, IO-aware exact attention still scales as O(N^2) total operations."),
                    ("6. Future Directions", "Key frontiers include hardware-aware multi-query attention, extending IO awareness to structured state space models (Mamba), and mixed-precision FP8 SRAM tiling kernels.")
                ]
            }
        ]
    },
    {
        "id": "bert",
        "filename": "BERT_Pretraining_Deep_Bidirectional_Transformers.pdf",
        "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        "authors": "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova (Google AI Language)",
        "abstract": "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications. BERT is conceptually simple and empirically powerful. It obtains new state-of-the-art results on eleven natural language processing tasks, including pushing the GLUE score to 80.5%, MultiNLI accuracy to 86.7%, and SQuAD v1.1 question answering Test F1 to 93.2, outperforming human performance by 2.0 points.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & The Unidirectional Limitation", "Language model pre-training has shown to be effective for improving many natural language processing tasks. However, standard architectures (such as OpenAI GPT) are unidirectional, where every token can only attend to previous tokens in the self-attention layers. Such restrictions are sub-optimal for sentence-level tasks, and can be devastating when applying fine-tuning based approaches to token-level tasks like SQuAD question answering where it is crucial to incorporate context from both directions."),
                    ("2. The Masked Language Model (MLM) Paradigm", "To train deep bidirectional representations, we propose the Masked Language Model (MLM). In this procedure, we simply mask some percentage of the input tokens at random (15%), and then predict those masked tokens. In addition, we also use a 'next sentence prediction' (NSP) task that jointly pre-trains text-pair representations. Unlike left-to-right language models, the MLM objective enables representations to fuse left and right context.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Architecture & Fine-Tuning Recipe", "BERT's model architecture is a multi-layer bidirectional Transformer encoder based on the original Transformer. We introduce two model sizes: BERT_BASE (L=12, H=768, A=12, Total Parameters=110M) and BERT_LARGE (L=24, H=1024, A=16, Total Parameters=340M). Fine-tuning BERT is straightforward: for sequence-level classification tasks, we pass the final hidden state of the first token [CLS] into an output classification layer.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Experimental Benchmarks on GLUE and SQuAD", "BERT achieves state-of-the-art results on 11 NLP tasks. On GLUE, BERT_LARGE attains an 80.5% average score (a 7.7% absolute improvement over existing methods). On SQuAD v1.1, BERT achieves 93.2 Test F1 score, outperforming top ensemble systems."),
                    ("5. Limitations and Masking Discrepancy", "BERT faces notable limitations: First, pre-training creates an artificial discrepancy between pre-training and fine-tuning because the [MASK] token never appears during fine-tuning. Second, BERT assumes masked tokens are conditionally independent given unmasked tokens, failing to model inter-token dependencies among predicted tokens. Third, bi-directional encoding prevents autoregressive token generation for creative generation tasks."),
                    ("6. Future Horizons", "Extensions include autoregressive pre-training (XLNet, RoBERTa removing NSP), span masking (SpanBERT), and parameter reduction through factorized embedding parametrization (ALBERT).")
                ]
            }
        ]
    },
    {
        "id": "rag",
        "filename": "RAG_Retrieval_Augmented_Generation.pdf",
        "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        "authors": "Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela",
        "abstract": "Large pre-trained language models have been shown to store factual knowledge in their parameters, and achieve state-of-the-art results when fine-tuned on downstream NLP tasks. However, their ability to access and precisely manipulate knowledge is still limited, and they often struggle on knowledge-intensive tasks, exhibiting hallucinations and failing to provide verifiable citations. In this paper, we explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) — models which combine pre-trained parametric and non-parametric memory for language generation. We introduce RAG-Sequence and RAG-Token models, which retrieve document passages using dense vector embeddings and condition a seq2seq generator on these passages. We evaluate on open-domain QA, question generation, and fact verification, setting new benchmarks on Natural Questions and TriviaQA.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & Parametric vs Non-Parametric Memory", "Pre-trained neural language models act as implicit knowledge bases, storing facts directly within billions of synaptic weights (parametric memory). However, parametric memory suffers from critical flaws: it cannot be easily expanded or updated without full retraining, it cannot reliably provide provenance or page citations for its claims, and it is prone to producing plausible-sounding factual hallucinations. We combine parametric memory with non-parametric memory—a dense vector index of Wikipedia passages retrieved using Maximum Inner Product Search (MIPS)."),
                    ("2. Dense Passage Retrieval (DPR) Integration", "The retrieval component utilizes Dense Passage Retriever (DPR) with dual bi-encoders: a question encoder q(x) and a passage encoder d(z) mapping text into 768-dimensional vectors. Retrieval probability p(z|x) is given by softmax(q(x)^T * d(z)). The top-k documents are retrieved efficiently using FAISS index.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. RAG Architectures: RAG-Sequence vs RAG-Token", "We formulate two RAG generation architectures conditioned on retrieved passages z:\n1. RAG-Sequence: The model retrieves k passages and uses the same document to generate the entire target sequence y: p_seq(y|x) = sum_z p(z|x) * prod_i p(y_i|x, z, y_{1:i-1}).\n2. RAG-Token: The model can draw upon different passages for each generated token: p_token(y|x) = prod_i sum_z p(z|x) * p(y_i|x, z, y_{1:i-1}). This allows the generator to synthesize content by combining multiple distinct knowledge sources across words.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Benchmark Results on Open-Domain QA", "On Open-Domain Natural Questions, RAG achieves 44.5% exact match (EM), outperforming REALM (40.4%) and T5-11B (34.5%). On TriviaQA, RAG reaches 56.8% EM. Generation evaluations show RAG produces factual text with 3x fewer hallucinations than closed-book models."),
                    ("5. Limitations and Retrieval Vulnerabilities", "RAG architectures exhibit distinct failure modes: First, if the retriever fails to retrieve relevant passages in top-k, the generator struggles to answer correctly ('retrieval mismatch'). Second, conflicting or contradictory information across retrieved passages can confuse the generator. Third, joint fine-tuning of the retrieval index and generator is computationally expensive."),
                    ("6. Research Gaps & Frontiers", "Future priorities include iterative multi-hop retrieval, self-reflective retrieval triggering (Self-RAG), and adaptive chunk routing in massive vector stores.")
                ]
            }
        ]
    },
    {
        "id": "dpo",
        "filename": "DPO_Direct_Preference_Optimization.pdf",
        "title": "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
        "authors": "Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D. Manning, Chelsea Finn (Stanford University)",
        "abstract": "While large-scale unsupervised language models learn broad world knowledge, aligning them with human preferences typically requires Reinforcement Learning from Human Feedback (RLHF). Standard RLHF involves fitting a reward model that reflects human preferences and then fine-tuning the language model using reinforcement learning (typically PPO). However, RLHF is complex and often unstable, requiring training multiple models and hyperparameter tuning. We propose Direct Preference Optimization (DPO), which implicitly optimizes the same objective as RLHF under a Bradley-Terry preference model, but in closed form with a single binary cross-entropy loss. DPO completely bypasses training an explicit reward model and sampling from the LM during fine-tuning, dramatically simplifying preference alignment while performing on par or better than RLHF algorithms.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & Instabilities of Conventional RLHF", "Aligning foundational language models with human values requires reinforcing helpfulness and penalizing toxic, inaccurate, or sycophantic outputs. The standard alignment paradigm, Reinforcement Learning from Human Feedback (RLHF), follows a multi-stage pipeline: (1) Supervised fine-tuning (SFT), (2) Training a neural reward model on pairwise preferences (y_w > y_l), and (3) Policy optimization using Proximal Policy Optimization (PPO) against the learned reward with a KL divergence penalty to prevent policy drift. In practice, PPO training is notoriously brittle, prone to reward hacking, hyperparameter collapse, and high computational memory requirements."),
                    ("2. Mathematical Derivation of DPO", "We leverage an analytical relationship between the reward function r(x, y) and the optimal policy pi*: r(x, y) = beta * log(pi*(y|x) / pi_ref(y|x)) + beta * log Z(x). Substituting this into the Bradley-Terry preference model p(y_w > y_l | x) = sigma(r(x, y_w) - r(x, y_l)) cancels out the partition function Z(x), yielding a direct objective over policy probabilities without explicit rewards:\nL_DPO(pi_theta; pi_ref) = - E_{(x, y_w, y_l)} [ log sigma( beta * log(pi_theta(y_w|x) / pi_ref(y_w|x)) - beta * log(pi_theta(y_l|x) / pi_ref(y_l|x)) ) ].")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Algorithmic Advantages over PPO", "DPO replaces the complex RL feedback loop with a stable, closed-form classification loss. It eliminates:\n1. The explicit reward model network.\n2. In-flight token sampling during training.\n3. Complex PPO actor-critic value network training.\nDPO is computationally equivalent to standard supervised fine-tuning while directly optimizing preference satisfaction.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Experimental Results on Summarization and Dialogue", "On TL;DR summarization, DPO models fine-tuned from Anthropic-HH and Reddit data achieve 61% win rate over PPO baselines when evaluated by GPT-4 and human judges. On Anthropic-HH dialogue, DPO matches or exceeds PPO across both helpfulness and harmlessness metrics with 3x faster wall-clock convergence."),
                    ("5. Limitations and Out-of-Distribution Degradation", "DPO exhibits vulnerabilities: First, DPO is offline—it cannot explore beyond the static dataset of pairwise preferences (y_w, y_l). Second, DPO loss can over-penalize unlikely rejected responses, degrading model confidence on out-of-distribution prompts. Third, DPO assumes consistent preference labels, and noisy annotations can corrupt implicit reward landscapes."),
                    ("6. Future Work", "Active research directions include online iterative DPO, multi-turn preference optimization, and combining DPO with verifiable mathematical reasoning (RLVR).")
                ]
            }
        ]
    },
    {
        "id": "deepseek_r1",
        "filename": "DeepSeek_R1_Reasoning_via_RL.pdf",
        "title": "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
        "authors": "DeepSeek-AI (Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, et al.)",
        "abstract": "We introduce our first-generation reasoning models, DeepSeek-R1-Zero and DeepSeek-R1. DeepSeek-R1-Zero, a model trained via large-scale reinforcement learning (RL) without supervised fine-tuning (SFT) as a preliminary step, demonstrates remarkable reasoning capabilities. Through RL, DeepSeek-R1-Zero naturally emerges with numerous powerful reasoning behaviors, including self-reflection, verification, and generating long chains of thought. However, R1-Zero encounters challenges such as poor readability and language mixing. To address these issues, we introduce DeepSeek-R1, which incorporates multi-stage training and cold-start data before RL. DeepSeek-R1 achieves performance comparable to OpenAI-o1-1217 on reasoning tasks, achieving 79.8% pass@1 on AIME 2024 and 97.3% on MATH-500. We also distill reasoning capabilities into smaller dense models (1.5B to 32B), which outperform comparable baselines.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & The Paradigm Shift in Reasoning", "Recent advancements in large language models have pushed frontier capabilities, yet reasoning benchmarks like competitive mathematics and software synthesis remained challenging for standard next-token predictors. Rather than relying on massive supervised human demonstrations of reasoning, we explore pure reinforcement learning (RL) to incentivize self-discovery of reasoning paths. DeepSeek-R1-Zero is trained directly on base models using Group Relative Policy Optimization (GRPO) without any prior supervised fine-tuning (SFT)."),
                    ("2. Group Relative Policy Optimization (GRPO) Mechanics", "To eliminate the memory burden of a critic network in PPO, GRPO samples a group of outputs {o_1, o_2, ..., o_G} for each question q from the old policy pi_theta_old, and optimizes the policy using relative advantages computed solely within the group:\nA_i = (r_i - mean(r)) / std(r).\nThe reward r_i combines rule-based accuracy rewards (e.g. verifying final mathematical answers in box format or code execution) and formatting rewards, completely removing the need for neural reward models.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. The DeepSeek-R1 Multi-Stage Training Pipeline", "To address language inconsistency and unstructured output in R1-Zero, DeepSeek-R1 adopts a four-stage pipeline:\nStage 1: Cold-start SFT with several thousand high-quality human-readable long chain-of-thought examples.\nStage 2: Reasoning-oriented RL using GRPO on math, logic, and coding benchmarks.\nStage 3: Rejection sampling to generate 800k synthetic reasoning and general-domain examples for comprehensive SFT.\nStage 4: Secondary RL with combined rule-based accuracy rewards and human preference alignment rewards."),
                    ("3.1 Knowledge Distillation into Dense Architectures", "We distill reasoning tokens from DeepSeek-R1 into smaller dense Qwen and Llama architectures (1.5B, 7B, 14B, 32B). Distillation yields superior results compared to training small models with RL from scratch.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Benchmark Performance & Mathematical Breakthroughs", "DeepSeek-R1 records 79.8% pass@1 on AIME 2024 (matching OpenAI-o1-1217), 97.3% on MATH-500, and 2029 Elo on Codeforces (top 96.3th percentile). The distilled 32B model attains 72.6% on AIME 2024, surpassing all open-source models of comparable scale."),
                    ("5. Limitations and Reasoning Vulnerabilities", "DeepSeek-R1 possesses clear limitations: First, inference latency is high due to long thinking traces (often several thousand reasoning tokens per query). Second, while strong in verifiable STEM domains with rule-based ground-truth rewards, applying GRPO to creative writing or subjective policy tasks remains challenging due to lack of deterministic reward verifiers. Third, overthinking on simple factual queries can lead to unnecessary computational overhead."),
                    ("6. Future Research Trajectories", "Key frontiers include dynamic thinking token budget allocation, extending pure RL reasoning to multi-modal visual proofs, and eliminating reasoning token verbosity through length penalties.")
                ]
            }
        ]
    },
    {
        "id": "llama",
        "filename": "LLaMA_Open_Foundation_Language_Models.pdf",
        "title": "LLaMA: Open and Efficient Foundation Language Models",
        "authors": "Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, Guillaume Lample (Meta AI)",
        "abstract": "We introduce LLaMA, a collection of foundation language models ranging from 7B to 65B parameters. We train our models on trillions of tokens, and show that it is possible to train state-of-the-art models using publicly available datasets exclusively, without resorting to proprietary and inaccessible datasets. In particular, LLaMA-13B outperforms GPT-3 (175B) on most benchmarks, and LLaMA-65B is competitive with the best models, Chinchilla-70B and PaLM-540B. Unlike previous efforts which optimized for training FLOPs alone, our focus is on serving efficiency: a smaller model trained on more data is cheaper to run at inference time.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & The Inference Efficiency Imperative", "Most recent work on large language models has focused on scaling parameter counts to hundreds of billions. However, recent scaling laws (Hoffmann et al., 2022) indicate that for a given compute budget, smaller models trained on significantly more data achieve superior downstream performance. Crucially, when considering total lifecycle cost, inference latency and hardware requirements dominate. We train models ranging from 7B to 65B parameters on 1.0T to 1.4T tokens of publicly accessible text."),
                    ("2. Architectural Modernizations", "LLaMA incorporates three key improvements over the standard Transformer:\n1. Pre-normalization (RMSNorm): Normalize input of each transformer sub-layer using RMSNorm to improve training stability.\n2. SwiGLU Activation Function: Replace ReLU non-linearity with SwiGLU activation (with dimension 2/3 * 4d) to boost model expressivity.\n3. Rotary Positional Embeddings (RoPE): Employ rotary embeddings at each layer to improve relative position modeling and extrapolation.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Pre-training Data Pipeline & Tokenizer", "The training corpus comprises 1.4 trillion tokens drawn exclusively from public sources: CommonCrawl (67%), C4 (15%), GitHub (4.5%), Wikipedia (4.5%), Gutenberg & Books3 (4.5%), ArXiv (2.5%), and Stack Exchange (2.0%). We utilize a Byte-Pair Encoding (BPE) tokenizer with 32,000 tokens, treating all numbers as individual digits to avoid arithmetic tokenization fragmentation.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Benchmark Performance Across Tasks", "On common-sense reasoning benchmarks (BoolQ, PIQA, SIQA, HellaSwag, WinoGrande, ARC), LLaMA-13B surpasses GPT-3 (175B) despite being over 10x smaller. On MMLU, LLaMA-65B achieves 63.4%, trailing only Chinchilla-70B (67.5%) and PaLM 540B (69.3%). On GSM8K grade-school math, LLaMA-65B records 50.9%."),
                    ("5. Limitations and Social Impact Disclosures", "LLaMA models exhibit standard autoregressive vulnerabilities: propensity to generate hallucinations, potential toxicity generation without safety RLHF alignment, and linguistic over-representation of English (82% of pre-training tokens). Additionally, models were released as base weights without fine-tuned instruction following."),
                    ("6. Future Directions", "Open priorities include scaling token horizons beyond 2T tokens, fine-grained instruction alignment (Llama-2/3), and extending native context window lengths beyond 2048 tokens.")
                ]
            }
        ]
    },
    {
        "id": "chinchilla",
        "filename": "Chinchilla_Compute_Optimal_Large_Language_Models.pdf",
        "title": "Training Compute-Optimal Large Language Models (Chinchilla)",
        "authors": "Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, Tom Hennigan, Eric Noland, Katie Millican, George van den Driessche, Bogdan Damoc, Aurelia Guy, Simon Osindero, Karen Simonyan, Erich Elsen, Jack W. Rae, Oriol Vinyals, Laurent Sifre (DeepMind)",
        "abstract": "We investigate the optimal model size and number of tokens for training a transformer language model under a given compute budget. We find that current large language models are significantly undertrained, a consequence of the recent focus on scaling language models whilst keeping the amount of training data constant. By training over 400 language models ranging from 70M to over 16B parameters on 5 to 500 billion tokens, we find that for compute-optimal training, the model size and the number of training tokens should be scaled equally: for every doubling of model size the number of training tokens should also be doubled. We test this hypothesis by training a more compute-optimal 70B model, called Chinchilla, using the same compute budget as Gopher (280B) but with 4x more data (1.4T tokens). Chinchilla uniformly and significantly outperforms Gopher (280B), GPT-3 (175B), Jurassic-1 (178B), and Megatron-Turing NLG (530B) on a large range of downstream evaluation tasks.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & The Undertraining Hypothesis", "The dominant consensus in natural language processing following Kaplan et al. (2020) suggested that model parameters N should be scaled faster than dataset tokens D (N ~ C^0.73, D ~ C^0.27). As a result, industry models scaled to hundreds of billions of parameters (Gopher 280B, GPT-3 175B) while training on relatively small token quantities (~300 billion tokens). We re-examine this scaling relationship across three complementary experimental regimes."),
                    ("2. Three Approaches to Deriving Scaling Exponents", "We evaluate: (1) Minimum loss per FLOP budget across 400 runs, (2) IsoFLOP profiles fitting quadratic loss contours, and (3) Fitting a parametric loss function L(N, D) = E + A / N^alpha + B / D^beta. All three methods consistently predict: alpha ~= 0.34 and beta ~= 0.28, implying that N and D should scale in equal proportion: N_opt ~ G^0.5, D_opt ~ G^0.5.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Chinchilla Model Specification", "To empirically validate our scaling law, we trained Chinchilla (70B parameters, 1.4T tokens) with an identical compute budget (5.76 x 10^23 FLOPs) to Gopher (280B parameters, 300B tokens). Chinchilla has 4x fewer parameters but was trained on 4.6x more tokens.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Quantitative Downstream Superiority", "Chinchilla significantly outperforms Gopher across all tasks: MMLU benchmark (67.5% vs 60.0%), Big-bench (65.1% vs 54.3%), and TriviaQA (65.4% vs 54.8%). Moreover, Chinchilla requires 4x less VRAM and substantially reduces downstream deployment costs."),
                    ("5. Algorithmic Constraints & Data Depletion Wall", "Scaling tokens proportionally to parameters encounters an imminent physical limitation: high-quality human linguistic corpora on the public web are finite (estimated at 5T-10T tokens). Equal scaling cannot continue indefinitely without synthetic data generation or multi-modal token streams."),
                    ("6. Future Research Trajectories", "Key open problems include compute-optimal scaling under quantization constraints, the role of curriculum ordering, and scaling laws for multi-turn reasoning RL.")
                ]
            }
        ]
    },
    {
        "id": "constitutional_ai",
        "filename": "Constitutional_AI_Harmlessness_from_AI_Feedback.pdf",
        "title": "Constitutional AI: Harmlessness from AI Feedback",
        "authors": "Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, Anna Chen, Anna Goldie, Azalia Mirhoseini, Cameron Perez, Colin Lovitt, Dawn Drain, Stanislav Fort, Ray Jiang, Tom Henighan, Nicholas Joseph, Saurav Sauveur, Nelson Elhage, Zac Hatfield-Dodds, Dario Amodei, Tom Brown, Sam McCandlish, Chris Olah, Jared Kaplan (Anthropic)",
        "abstract": "As AI systems become more capable, we would like to enlist their help to supervise other AIs and scale human supervision. We experiment with methods for training a harmless AI assistant through self-improvement, without any human labels for identifying harmful outputs. The only human input is a list of principles or instructions (a constitution). The process involves both a supervised learning phase (critique and revision) and a reinforcement learning phase (RL from AI Feedback, RLAIF). The resulting model, Constitutional AI, is significantly more harmless than models trained with human feedback, without degrading helpfulness.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & The Scaled Oversight Challenge", "Human feedback (RLHF) has proven effective for steering language models, but human evaluation is expensive, difficult to scale, and vulnerable to human oversight fatigue and annotator bias. In Constitutional AI (CAI), humans provide only high-level normative rules—a constitution based on the UN Declaration of Human Rights, ethical principles, and harmlessness guidelines. The AI assistant then critiques and revises its own responses to comply with these constitutional directives."),
                    ("2. The Supervised Phase: Critique and Revision", "The model starts with red-team prompts designed to elicit toxic or harmful responses. For each output: (1) The model is prompted to critique its own response according to a constitution rule, (2) The model rewrites its response to remove harm while maintaining helpfulness, and (3) The base model is fine-tuned on these revised harmless responses using standard supervised learning (SL-CAI).")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Reinforcement Learning from AI Feedback (RLAIF)", "In the second phase, the SL-CAI model generates pairs of responses to challenging prompts. A feedback model evaluates which response better adheres to a specified constitutional principle. We train a preference model on these AI-generated labels, eliminating human annotator exposure to toxic material. Finally, we optimize the policy using PPO against this AI preference model.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Empirical Results & Harmlessness Pareto Frontiers", "Constitutional AI substantially improves the harmlessness-helpfulness Pareto frontier compared to standard RLHF. On red-teaming evaluations, CAI exhibits 50% fewer harmful completions than RLHF baselines while maintaining zero evasiveness on benign queries."),
                    ("5. Limitations and Alignment Vulnerabilities", "Constitutional AI possesses specific limitations: First, conflicting principles within the constitution can lead to ambiguous critiques. Second, the feedback model can develop blind spots or sycophancy, reinforcing covert harms. Third, CAI still depends on the base model's capacity to comprehend and reason about subtle ethical guidelines."),
                    ("6. Future Horizons", "Frontiers include dynamic constitutional deliberation, transparent auditability of self-critique chains, and cross-cultural constitutional synthesis.")
                ]
            }
        ]
    },
    {
        "id": "chain_of_thought",
        "filename": "Chain_of_Thought_Prompting_Elicits_Reasoning.pdf",
        "title": "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
        "authors": "Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Fei Xia, Ed Chi, Quoc V. Le, Denny Zhou (Google Research, Brain Team)",
        "abstract": "We explore how generating a chain of thought—a series of intermediate reasoning steps—significantly improves the ability of large language models to perform complex reasoning. In particular, we show how such reasoning abilities emerge naturally in sufficiently large language models via a simple method called chain-of-thought prompting, where a few chain-of-thought demonstrations are provided as exemplars in prompting. Experiments on arithmetic, commonsense, and symbolic reasoning benchmarks show that chain-of-thought prompting elicits reasoning that standard prompting fails to achieve. For instance, chain-of-thought prompting with PaLM 540B achieves 58% solve rate on GSM8K without fine-tuning, outperforming standard prompting by over 3x.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & Multi-Step Reasoning Deficits", "While language models excel at next-word prediction on factual and stylistic tasks, multi-step arithmetic, commonsense, and symbolic reasoning have historically suffered steep performance declines. Standard few-shot prompting maps an input prompt directly to an output answer: <input, output>. For complex mathematical word problems, this requires mapping directly across latent reasoning steps without intermediate computation."),
                    ("2. Chain-of-Thought Prompting Mechanics", "We introduce chain-of-thought prompting: providing exemplars formatted as triples: <input, chain of thought, output>. The intermediate chain of thought mimics human step-by-step problem-solving. This allows models to decompose multi-hop reasoning into coherent sub-steps, allocating more computation (tokens) to problems that require deeper contemplation.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Emergence as a Function of Model Scale", "A critical empirical discovery is that chain-of-thought prompting does not improve performance for small models (<10B parameters), which often produce fluent but illogical thought traces. Chain-of-thought reasoning is an emergent ability that appears sharply around ~100B parameters in models like PaLM, GPT-3, and LaMDA.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Quantitative Benchmarks on Math and Symbolic Tasks", "On GSM8K (grade-school math), PaLM 540B with chain-of-thought achieves 58.1% accuracy (up from 17.9% with standard prompting). On SVAMP math benchmarks, it reaches 79.0%. On symbolic reasoning (last-letter concatenation and coin flip tracking), CoT enables perfect length extrapolation."),
                    ("5. Limitations and Failure Modes", "Chain-of-thought prompting has known failure modes: (1) Semantic illusion: models can generate completely convincing yet factually invalid arithmetic steps, (2) Step-error propagation: a single arithmetic mistake in step 2 completely invalidates all subsequent steps, and (3) Increased inference cost due to generating dozens of reasoning tokens per response."),
                    ("6. Future Work", "Extending CoT to self-consistency sampling (voting over multiple reasoning paths), program-aided reasoning (PAL), and zero-shot reasoning ('Let's think step by step').")
                ]
            }
        ]
    },
    {
        "id": "qlora",
        "filename": "QLoRA_Efficient_Finetuning_of_Quantized_LLMs.pdf",
        "title": "QLoRA: Efficient Finetuning of Quantized LLMs",
        "authors": "Tim Dettmers, Artidoro Pagnoni, Ari Holtzman, Luke Zettlemoyer (University of Washington)",
        "abstract": "We present QLoRA, an efficient finetuning approach that reduces memory usage enough to finetune a 65B parameter model on a single 48GB GPU while preserving full 16-bit finetuning task performance. QLoRA backpropagates gradients through a frozen, 4-bit quantized pretrained language model into Low Rank Adapters (LoRA). We introduce (1) 4-bit NormalFloat (NF4), a newly proposed information-theoretically optimal quantization data type for normally distributed weights; (2) Double Quantization to reduce the average memory footprint by quantizing the quantization constants; and (3) Paged Optimizers to manage memory spikes during gradient checkpointing. We use QLoRA to train the Guanaco family of models, which achieve 99.3% of the ChatGPT performance level on the Vicuna benchmark after only 24 hours of finetuning on a single consumer GPU.",
        "pages": [
            {
                "page": 1,
                "sections": [
                    ("1. Introduction & Democratizing Large Model Adaptation", "Finetuning large language models (such as 65B architectures) requires over 780 GB of GPU memory for 16-bit weights and optimizer states, limiting adaptation to large corporate research laboratories. QLoRA solves this bottleneck by quantizing frozen weights to 4-bit precision while updating full 16-bit low-rank adapter weights."),
                    ("2. 4-bit NormalFloat (NF4) Quantization", "Pretrained neural network weights typically follow a normal distribution N(0, sigma^2). Standard integer or floating-point quantization bins have equal intervals or non-optimal quantile spacings. NF4 constructs an information-theoretically optimal quantile quantization grid where each bin has equal expected probability mass under a Gaussian distribution, minimizing theoretical quantization distortion.")
                ]
            },
            {
                "page": 2,
                "sections": [
                    ("3. Double Quantization & Paged Optimizers", "QLoRA introduces two memory engineering innovations:\n1. Double Quantization (DQ): Quantizing the quantization scale constants themselves (from FP32 to 8-bit FP) saves 0.37 bits per parameter (~3 GB on a 65B model).\n2. Paged Optimizers: Uses CUDA Unified Memory to automatically page optimizer states to CPU RAM during activation spikes, preventing out-of-memory errors during long-sequence gradient checkpointing.")
                ]
            },
            {
                "page": 3,
                "sections": [
                    ("4. Benchmark Performance & The Guanaco Suite", "On MMLU and Vicuna benchmarks, QLoRA with Guanaco-65B reaches 99.3% of ChatGPT quality, outperforming 16-bit fine-tuned models while running on a single 48GB GPU. Memory footprint drops from 780 GB to 48 GB with zero degradation in task accuracy."),
                    ("5. Limitations and Latency Trade-Offs", "QLoRA incurs practical trade-offs: (1) Quantization dequantization overhead in custom CUDA kernels slows down training wall-clock time by ~30% compared to unquantized 16-bit LoRA, (2) Extreme parameter outliers in 4-bit representation can still induce subtle precision loss on specialized tasks."),
                    ("6. Future Work", "Frontiers include combining QLoRA with 2-bit weight representations, applying NF4 to speculative decoding, and native integer arithmetic without dequantization.")
                ]
            }
        ]
    }
]

def create_pdf_from_spec(spec: Dict[str, Any], output_path: Path) -> Path:
    """
    Creates a publication-grade PDF file from an academic spec dictionary.
    """
    doc = fitz.open()

    for page_data in spec["pages"]:
        page = doc.new_page(width=595, height=842) # A4 size

        y_offset = 50
        if page_data["page"] == 1:
            # Title
            page.insert_text(
                (50, y_offset),
                spec["title"],
                fontsize=14,
                fontname="helv",
                color=(0.08, 0.12, 0.25)
            )
            y_offset += 26

            # Authors
            page.insert_text(
                (50, y_offset),
                f"Authors: {spec['authors']}",
                fontsize=8.5,
                fontname="helv",
                color=(0.3, 0.35, 0.4)
            )
            y_offset += 20

            # Abstract Header
            page.insert_text(
                (50, y_offset),
                "ABSTRACT",
                fontsize=9.5,
                fontname="helv",
                color=(0.1, 0.25, 0.5)
            )
            y_offset += 14

            rect = fitz.Rect(50, y_offset, 545, y_offset + 130)
            page.insert_textbox(rect, spec["abstract"], fontsize=8, fontname="helv")
            y_offset += 145

        # Sections on page
        for sec_title, sec_content in page_data["sections"]:
            page.insert_text(
                (50, y_offset),
                sec_title,
                fontsize=10.5,
                fontname="helv",
                color=(0.05, 0.18, 0.4)
            )
            y_offset += 16

            rect = fitz.Rect(50, y_offset, 545, y_offset + 165)
            page.insert_textbox(rect, sec_content, fontsize=8, fontname="helv")
            y_offset += 175

        # Footer
        page.insert_text(
            (270, 815),
            f"Page {page_data['page']}",
            fontsize=8,
            fontname="helv",
            color=(0.5, 0.5, 0.5)
        )

    doc.save(str(output_path))
    doc.close()
    return output_path

def create_custom_paper_pdf(
    title: str,
    authors: str,
    abstract: str,
    methodology: str = "",
    findings: str = "",
    limitations: str = "",
    raw_content: str = "",
    output_path: Optional[Path] = None
) -> Path:
    """
    Creates an academic PDF from user-provided paper sections.
    """
    if not output_path:
        sanitized = re.sub(r'[^a-zA-Z0-9_-]', '_', title)[:40]
        output_path = UPLOAD_DIR / f"{sanitized}_{uuid.uuid4().hex[:6]}.pdf"

    doc = fitz.open()

    # Page 1: Title, Authors, Abstract, Section 1 Introduction / Overview
    page1 = doc.new_page(width=595, height=842)
    y = 50
    page1.insert_text((50, y), title[:75], fontsize=14, fontname="helv", color=(0.08, 0.12, 0.25))
    y += 24
    page1.insert_text((50, y), f"Authors: {authors[:100]}", fontsize=8.5, fontname="helv", color=(0.3, 0.35, 0.4))
    y += 22
    page1.insert_text((50, y), "ABSTRACT", fontsize=9.5, fontname="helv", color=(0.1, 0.25, 0.5))
    y += 14
    rect1 = fitz.Rect(50, y, 545, y + 140)
    page1.insert_textbox(rect1, abstract or "Academic paper uploaded to RESEARCHMIND.", fontsize=8, fontname="helv")
    y += 155

    page1.insert_text((50, y), "1. Introduction & Research Objectives", fontsize=10.5, fontname="helv", color=(0.05, 0.18, 0.4))
    y += 16
    intro_text = raw_content[:800] if raw_content else f"This research investigates {title}. The primary research objective is to advance state-of-the-art methodology in machine learning, offering theoretical justifications and empirical validation across standard benchmarks."
    rect2 = fitz.Rect(50, y, 545, y + 180)
    page1.insert_textbox(rect2, intro_text, fontsize=8, fontname="helv")
    page1.insert_text((270, 815), "Page 1", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))

    # Page 2: Methodology & Findings
    page2 = doc.new_page(width=595, height=842)
    y = 50
    page2.insert_text((50, y), "2. Methodology & Proposed Architecture", fontsize=10.5, fontname="helv", color=(0.05, 0.18, 0.4))
    y += 16
    meth_text = methodology if methodology else (raw_content[800:1600] if len(raw_content) > 800 else "The proposed architectural formulation optimizes algorithmic efficiency and parameter representation through structured inductive biases and scalable training procedures.")
    rect3 = fitz.Rect(50, y, 545, y + 180)
    page2.insert_textbox(rect3, meth_text, fontsize=8, fontname="helv")
    y += 195

    page2.insert_text((50, y), "3. Empirical Results & Comparative Evaluation", fontsize=10.5, fontname="helv", color=(0.05, 0.18, 0.4))
    y += 16
    find_text = findings if findings else (raw_content[1600:2400] if len(raw_content) > 1600 else "Quantitative benchmarks establish statistically significant gains over baseline architectures, showing improved parameter efficiency, lower latency, and higher generalization scores.")
    rect4 = fitz.Rect(50, y, 545, y + 180)
    page2.insert_textbox(rect4, find_text, fontsize=8, fontname="helv")
    page2.insert_text((270, 815), "Page 2", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))

    # Page 3: Limitations & Future Directions
    page3 = doc.new_page(width=595, height=842)
    y = 50
    page3.insert_text((50, y), "4. Disclosed Limitations & Boundary Conditions", fontsize=10.5, fontname="helv", color=(0.05, 0.18, 0.4))
    y += 16
    lim_text = limitations if limitations else "The primary limitations include high computational memory footprint during long-sequence processing, lack of cross-lingual evaluation on low-resource languages, and sensitivity to extreme quantization thresholds."
    rect5 = fitz.Rect(50, y, 545, y + 180)
    page3.insert_textbox(rect5, lim_text, fontsize=8, fontname="helv")
    y += 195

    page3.insert_text((50, y), "5. Future Research Directions & Open Inquiries", fontsize=10.5, fontname="helv", color=(0.05, 0.18, 0.4))
    y += 16
    rect6 = fitz.Rect(50, y, 545, y + 180)
    page3.insert_textbox(rect6, "Future trajectories focus on sub-quadratic attention scaling, automated hyperparameter optimization, and extending the methodology to multi-modal visual and auditory reasoning.", fontsize=8, fontname="helv")
    page3.insert_text((270, 815), "Page 3", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))

    doc.save(str(output_path))
    doc.close()
    return output_path

def generate_sample_pdfs():
    """
    Creates high-fidelity PDF documents for initial benchmark research papers.
    """
    generated_files = []
    # Seed top 7 papers by default
    for spec in PAPERS_SPEC[:7]:
        file_path = SAMPLE_DIR / spec["filename"]
        create_pdf_from_spec(spec, file_path)
        generated_files.append(str(file_path))
    return generated_files

def get_all_catalog_specs() -> List[Dict[str, Any]]:
    """
    Returns specifications for all available curated landmark papers.
    """
    return PAPERS_SPEC
