
import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type Profile = {
  skills?: string | string[];
  degree?: string;
  field?: string;
  fieldOfStudy?: string;
  qualification?: string;
  highestQualification?: string;
  graduationYear?: string | number;
  interests?: string | string[];
  location?: string;
  workMode?: string;
  preferredWorkMode?: string;
};

const PROFILE_KEY = "opportunityGapProfileDraft";

const suggestions = [
  "Create a 30-day Java Full Stack roadmap for me.",
  "Which Java Full Stack skills am I missing?",
  "Prepare me for a fresher Java interview.",
  "How can I improve my resume?",
  "How can I improve my chances of getting hired?",
];

function getProfile(): Profile {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  } catch {
    return {};
  }
}

function asText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}

function getProfileSkills(profile: Profile): string[] {
  return asText(profile.skills)
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function hasSkill(skills: string[], aliases: string[]): boolean {
  return aliases.some((alias) =>
    skills.some((skill) => skill.includes(alias.toLowerCase()))
  );
}

function getProfileSummary(profile: Profile): string {
  return `Qualification: ${
    profile.qualification || profile.highestQualification || "Not provided"
  }
Degree: ${profile.degree || "Not provided"}
Field of study: ${
    profile.field || profile.fieldOfStudy || "Not provided"
  }
Graduation year: ${profile.graduationYear || "Not provided"}
Skills: ${asText(profile.skills) || "No skills listed yet"}
Interests: ${asText(profile.interests) || "Not provided"}
Preferred location: ${profile.location || "Not provided"}
Preferred work mode: ${
    profile.workMode || profile.preferredWorkMode || "Not provided"
  }`;
}

function generateRoadmap(): string {
  return `YOUR 30-DAY JAVA FULL STACK LEARNING ROADMAP

WEEK 1 — Strengthen Java fundamentals

Day 1: Revise variables, data types, operators and control statements.
Day 2: Practise methods, arrays and strings.
Day 3: Revise OOP: classes, objects, inheritance and polymorphism.
Day 4: Practise abstraction, interfaces and encapsulation.
Day 5: Study exception handling and custom exceptions.
Day 6: Learn Collections: List, Set, Map and ArrayList.
Day 7: Solve 5–8 Java problems and revise the week's topics.

WEEK 2 — SQL, DSA and backend foundations

Day 8: Practise SQL SELECT, WHERE, ORDER BY and GROUP BY.
Day 9: Practise joins, subqueries and aggregate functions.
Day 10: Revise database design, primary keys and foreign keys.
Day 11: Practise arrays and strings in Java.
Day 12: Learn searching, sorting and time complexity basics.
Day 13: Study REST APIs, HTTP methods and JSON.
Day 14: Build a small Java program that connects to a database.

WEEK 3 — Spring Boot

Day 15: Understand Spring, dependency injection and Spring Boot.
Day 16: Create a basic Spring Boot project.
Day 17: Build REST endpoints using controllers.
Day 18: Learn services, repositories and layered architecture.
Day 19: Connect Spring Boot to MySQL using JPA.
Day 20: Practise CRUD operations.
Day 21: Add validation and exception handling.

WEEK 4 — Full Stack practice and job preparation

Day 22: Revise HTML, CSS and JavaScript.
Day 23: Practise React components, props and state.
Day 24: Connect React to a Spring Boot REST API.
Day 25: Add form handling, validation and error messages.
Day 26: Test your application and fix bugs.
Day 27: Improve your GitHub repositories and README files.
Day 28: Practise Java, SQL and basic DSA interview questions.
Day 29: Prepare your project explanation and mock interview.
Day 30: Review weak topics, update your resume and apply to suitable fresher roles.

YOUR DAILY ROUTINE

• 60 minutes: Learn and revise concepts.
• 60 minutes: Practise coding.
• 60 minutes: Build or improve a project.
• 30 minutes: Interview questions and revision.

PRIORITY

Do not try to master everything in 30 days. Focus on Java, SQL, Spring Boot, REST APIs and practical project explanations first.

Use this roadmap as a guide and adjust the pace according to your progress.`;
}

function generateSkillGap(profile: Profile): string {
  const skills = getProfileSkills(profile);

  const requirements = [
    { name: "Java fundamentals and OOP", aliases: ["java", "oop", "object oriented"], priority: "High" },
    { name: "Java Collections Framework", aliases: ["collections", "arraylist", "hashmap"], priority: "High" },
    { name: "Exception handling", aliases: ["exception handling", "exceptions"], priority: "High" },
    { name: "SQL and MySQL", aliases: ["sql", "mysql"], priority: "High" },
    { name: "Spring Boot", aliases: ["spring boot", "springboot"], priority: "High" },
    { name: "REST APIs", aliases: ["rest api", "rest apis", "restful"], priority: "High" },
    { name: "React", aliases: ["react", "react.js"], priority: "Medium" },
    { name: "Git and GitHub", aliases: ["git", "github"], priority: "Medium" },
    { name: "Data Structures and Algorithms", aliases: ["dsa", "data structures", "algorithms"], priority: "High" },
    { name: "Unit testing", aliases: ["junit", "unit testing", "testing"], priority: "Medium" },
  ];

  const listed = requirements.filter((item) =>
    hasSkill(skills, item.aliases)
  );

  const notListed = requirements.filter(
    (item) => !hasSkill(skills, item.aliases)
  );

  return `JAVA FULL STACK SKILL GAP REVIEW

I compared the skills listed in your saved profile against a practical Java Full Stack fresher skill checklist.

YOUR PROFILE
${getProfileSummary(profile)}

SKILLS ALREADY LISTED IN YOUR PROFILE

${
  listed.length
    ? listed.map((item) => `• ${item.name}`).join("\n")
    : "No matching skills were found in your profile."
}

SKILLS NOT CURRENTLY LISTED

${
  notListed.length
    ? notListed
        .map((item) => `• ${item.name} — ${item.priority} priority`)
        .join("\n")
    : "All the skills in this checklist are listed in your profile."
}

WHAT TO FOCUS ON FIRST

1. Strengthen Java Collections and exception handling.
2. Learn Spring Boot and build REST APIs.
3. Practise SQL joins and database operations.
4. Solve basic arrays, strings and searching problems.
5. Practise React-to-backend integration.
6. Learn JUnit and basic application testing.

IMPORTANT: A skill being listed in your profile does not prove mastery. This is a profile-based checklist, not a formal skill assessment.`;
}

function generateResponse(question: string): string {
  const q = question.toLowerCase().trim();
  const profile = getProfile();

  if (
    q.includes("roadmap") ||
    q.includes("30 day") ||
    q.includes("30-day") ||
    q.includes("learning plan") ||
    q.includes("study plan")
  ) {
    return generateRoadmap();
  }

  if (
    q.includes("missing skill") ||
    q.includes("skills am i missing") ||
    q.includes("skill gap") ||
    q.includes("skills do i lack") ||
    q.includes("compare my skills") ||
    q.includes("what should i improve") ||
    q.includes("weakness")
  ) {
    return generateSkillGap(profile);
  }

  if (
    q.includes("interview") ||
    q.includes("placement preparation") ||
    q.includes("mock interview")
  ) {
    return `JAVA FULL STACK FRESHER INTERVIEW PREPARATION

Prepare in these five areas:

1. JAVA
• OOP principles and their real examples.
• String handling and immutability.
• Collections: ArrayList, HashMap and HashSet.
• Exception handling.
• Basic coding problems using arrays and strings.

2. SQL
• SELECT, WHERE and GROUP BY.
• INNER JOIN and LEFT JOIN.
• Primary keys and foreign keys.
• Subqueries and aggregate functions.

3. SPRING BOOT
• Dependency injection.
• Controller, Service and Repository layers.
• REST API methods.
• JPA and database connectivity.

4. PROJECT DISCUSSION
Prepare to explain:
• What problem your project solves.
• Why you selected its technology stack.
• How the frontend communicates with the backend.
• How data is stored in MySQL.
• One difficult bug you solved.

5. HR QUESTIONS
Practise:
• Tell me about yourself.
• Why should we hire you?
• What are your strengths?
• Why do you want this role?

DAILY PRACTICE: Solve 2 Java questions, 2 SQL questions and explain one project feature aloud.`;
  }

  if (q.includes("resume") || q.includes("cv")) {
    return `RESUME IMPROVEMENT PLAN

Based on your saved profile:

${getProfileSummary(profile)}

For a Java Full Stack fresher resume, prioritise:

1. PROFESSIONAL SUMMARY
Mention your Computer Science background and interest in Java development.

2. PROJECTS
Explain the problem, technology stack and your contribution.
Include your Opportunity Gap project and AI Fuel Expense Tracker if they are ready to demonstrate.

3. TECHNICAL SKILLS
Group skills into:
• Programming: Java, JavaScript.
• Backend: Spring Boot, REST APIs, Node.js if applicable.
• Frontend: React and React Native if applicable.
• Database: MySQL, SQL, SQLite.
• Tools: Git and GitHub.

Only list technologies you can confidently explain.

4. EDUCATION
Clearly show your Integrated BS-MS Computer Science degree and graduation year.

5. GITHUB
Keep repositories organised, add useful READMEs and include screenshots.

6. FINAL CHECK
Keep the resume concise, check spelling and tailor it to each job description.`;
  }

  if (
    q.includes("java") ||
    q.includes("programming skills") ||
    q.includes("full stack skills") ||
    q.includes("technical skills")
  ) {
    return `JAVA FULL STACK SKILLS — YOUR LEARNING PRIORITIES

For entry-level Java Full Stack roles, organise your preparation into these stages.

STAGE 1 — JAVA CORE
• OOP principles.
• Arrays and strings.
• Collections Framework.
• Exception handling.
• Basic coding and problem solving.

STAGE 2 — DATABASES
• SQL queries and joins.
• MySQL database design.
• Primary and foreign keys.
• CRUD operations.

STAGE 3 — BACKEND
• Spring Boot.
• REST APIs.
• Spring Data JPA.
• Validation and exception handling.
• MySQL integration.

STAGE 4 — FRONTEND
• HTML and CSS.
• JavaScript.
• React components and hooks.
• API integration.

STAGE 5 — PROFESSIONAL PRACTICE
• Git and GitHub.
• Unit testing.
• Debugging.
• Project documentation.

YOUR NEXT PRIORITY

Start with Java Collections, exception handling and Spring Boot. Then practise building a complete CRUD application with React, Spring Boot and MySQL.

You do not need to learn every framework at once.`;
  }

  if (
    q.includes("job") ||
    q.includes("get hired") ||
    q.includes("job chances") ||
    q.includes("job search") ||
    q.includes("career")
  ) {
    return `FRESHER JOB SEARCH STRATEGY

Your saved profile:
${getProfileSummary(profile)}

For Java Developer and Java Full Stack fresher roles, use this approach:

1. TARGET THE RIGHT ROLES
Search for:
• Graduate Software Engineer.
• Junior Java Developer.
• Associate Software Engineer.
• Java Full Stack Developer.
• Entry-Level Software Developer.

2. CHECK ELIGIBILITY
Verify degree requirements, graduation year, experience requirements and location.

3. PRIORITISE DIRECT HIRING
Look for official company hiring challenges, coding assessments and fresher recruitment drives.

4. PREPARE FOR ASSESSMENTS
Practise Java MCQs, coding problems, SQL and basic aptitude.

5. BUILD PROJECT EVIDENCE
Keep your GitHub projects working and prepare to demonstrate them.

6. TRACK APPLICATIONS
Record the company, role, date, application link and status.

7. AVOID FRAUD
Never pay a recruiter for a job offer. Verify vacancies on official employer websites.

Use Explore Opportunities to organise opportunities, but independently verify each listing before applying.`;
  }

  if (q.includes("project") || q.includes("portfolio") || q.includes("github")) {
    return `PROJECT AND PORTFOLIO IMPROVEMENT

A project should demonstrate that you can build, connect and maintain an application.

For your Opportunity Gap project, prepare to explain:
• User registration and login.
• Opportunity discovery and filtering.
• Saving opportunities.
• Application tracking.
• Profile-based eligibility comparison.
• Notifications and deadline reminders.
• React frontend, Spring Boot backend and MySQL database.

For each project, prepare:
1. A clear README.
2. Screenshots of the working application.
3. Technology stack.
4. Database structure.
5. Key features.
6. Challenges and solutions.

Be honest about prototype features and explain what you would improve next.`;
  }

  if (q.includes("scholarship") || q.includes("financial aid")) {
    return `SCHOLARSHIP SEARCH CHECKLIST

Before applying, check:

1. Academic qualification and marks criteria.
2. Eligible courses and institutions.
3. Family income requirements, if any.
4. Required certificates and documents.
5. Application deadline.
6. Official application portal.
7. Renewal conditions, if applicable.

Keep your academic certificates, identity documents and bank details ready where required.

Never pay an unknown person to secure a scholarship. Verify the scheme using its official website.`;
  }

  if (
    q.includes("my profile") ||
    q.includes("my qualification") ||
    q.includes("my education") ||
    q.includes("what do you know about me")
  ) {
    return `YOUR SAVED PROFILE

${getProfileSummary(profile)}

This information is read from your browser's saved profile draft. Update My Profile if anything is missing or outdated.`;
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/.test(q)) {
    return "Hello! 👋 I'm your Opportunity Gap Career Assistant. I can help you with Java Full Stack preparation, skill-gap reviews, learning roadmaps, fresher jobs, resumes, projects and interviews. What would you like to work on?";
  }

  return `I can help you with specific career tasks. Try one of these:

• Create a 30-day Java Full Stack roadmap.
• Compare my current skills with Java Developer requirements.
• Prepare a fresher Java interview plan.
• Improve my resume for software developer roles.
• Create a job-search strategy.
• Help me explain my Opportunity Gap project.

You can also ask a question in your own words.`;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Welcome to your Career Assistant! 👋\n\nI can help you with personalised learning plans, Java Full Stack preparation, skill-gap reviews, fresher jobs, resumes, projects and interviews.\n\nWhat would you like help with today?",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = (value: string) => {
    const text = value.trim();
    if (!text || sending) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");
    setSending(true);

    window.setTimeout(() => {
      const response: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: generateResponse(text),
      };

      setMessages((previous) => [...previous, response]);
      setSending(false);
    }, 400);
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: "New conversation started! 👋 What career question can I help you with?",
      },
    ]);
  };

  return (
    <div className="career-assistant">
      <header className="career-assistant-header">
        <div className="career-assistant-heading">
          <p className="career-assistant-eyebrow">YOUR CAREER COMPANION</p>
          <h2>Career Assistant <span>✦</span></h2>
          <p className="career-assistant-subtitle">
            Guidance for your next opportunity
          </p>
        </div>

        <button
          type="button"
          className="career-assistant-reset"
          onClick={resetChat}
        >
          New Chat
        </button>
      </header>

      <div className="career-assistant-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`career-message-row ${message.role}`}
          >
            <div className={`career-message ${message.role}`}>
              {message.text}
            </div>
          </div>
        ))}

        {sending && (
          <div className="career-typing">
            <span />
            <span />
            <span />
            <small>Preparing your response...</small>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="career-assistant-footer">
        {messages.length === 1 && (
          <div className="career-suggestions">
            <p>Suggested questions</p>

            <div className="career-suggestion-list">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => sendMessage(item)}
                  disabled={sending}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          className="career-assistant-form"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(question);
          }}
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask your career question..."
            disabled={sending}
          />

          <button
            type="submit"
            disabled={!question.trim() || sending}
          >
            Send <span>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
