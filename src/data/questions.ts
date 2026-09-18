import { AssessmentQuestion } from "../types";

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "q1",
    category: "personality",
    question: "When faced with an incredibly complex, poorly defined problem, what is your immediate instinct?",
    options: [
      "Deconstruct it logically into small, manageable systems and rules.",
      "Brainstorm innovative, out-of-the-box approaches to bypass the problem entirely.",
      "Gather a team of experts and coordinate a collaborative strategy.",
      "Dive into the data and research to find existing patterns or solutions."
    ]
  },
  {
    id: "q2",
    category: "skill",
    question: "If you had unlimited resources to build something, where would your focus lie?",
    options: [
      "Architecting a flawless, scalable technological infrastructure.",
      "Designing a beautiful, intuitive experience that captivates users.",
      "Creating a sustainable business model with massive global reach.",
      "Developing advanced AI or algorithms to predict future trends."
    ]
  },
  {
    id: "q3",
    category: "interest",
    question: "Which type of failure is most acceptable to you during a project?",
    options: [
      "A failed prototype that taught you how to build the final version better.",
      "A creative risk that missed the mark but pushed boundaries.",
      "A strategic pivot after realizing the market didn't want the product.",
      "A hypothesis proven wrong after rigorous statistical testing."
    ]
  },
  {
    id: "q4",
    category: "refinement",
    question: "How do you prefer to interact with other people in a professional setting?",
    options: [
      "As a mentor/mentee, focusing on deep knowledge transfer.",
      "As a co-creator in a highly dynamic, unstructured environment.",
      "As a leader directing resources and aligning stakeholders.",
      "As an independent contributor delivering specialized expertise."
    ]
  },
  {
    id: "q5",
    category: "refinement",
    question: "What is your ultimate measure of career success?",
    options: [
      "Solving a fundamental technical or scientific challenge.",
      "Leaving a legacy of unique, inspiring creations.",
      "Achieving significant financial freedom and industry influence.",
      "Improving the lives of millions through applied systems."
    ]
  }
];
