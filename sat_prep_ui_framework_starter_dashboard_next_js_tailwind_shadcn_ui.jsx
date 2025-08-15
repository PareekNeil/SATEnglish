import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Play,
  RotateCcw,
  BarChart3,
  Settings,
  CheckCircle2,
  Clock,
  Flag,
  ChevronRight,
  Check,
  X,
  Upload,
  Filter,
  Wand2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

// ---
// SAT (DSAT) English Tutor & Generator — UI Framework
// Stack: Next.js + TailwindCSS + shadcn/ui + lucide-react + recharts + framer-motion
// This single-file demo provides all key screens wired by a local "view" state router so you can drop it into /app/page.tsx.
// Replace mock data + handlers with your API calls. Keep components as reference for production separation into routes.
// ---

// ===== Mock Data & Types (simplified) =====
const DOMAINS = [
  { id: "Craft&Structure", label: "Craft & Structure" },
  { id: "Information&Ideas", label: "Information & Ideas" },
  { id: "StdEngConv", label: "Standard English Conventions" },
  { id: "ExprOfIdeas", label: "Expression of Ideas" },
];

const SKILLS: Record<string, string[]> = {
  "Craft&Structure": ["main-idea", "purpose", "tone", "structure"],
  "Information&Ideas": ["detail", "inference", "evidence"],
  StdEngConv: ["boundaries", "agreement", "modifiers", "commas"],
  ExprOfIdeas: ["transition", "concision", "redundancy"],
};

const masteryData = [
  { skill: "Boundaries", mastery: 62 },
  { skill: "Purpose", mastery: 58 },
  { skill: "Transitions", mastery: 44 },
  { skill: "Main idea", mastery: 71 },
  { skill: "Evidence", mastery: 54 },
  { skill: "Concision", mastery: 66 },
];

const mistakes = [
  { id: 1, label: "Comma splice", domain: "Standard English Conventions", trap: "sentence boundary" },
  { id: 2, label: "Contrast pivot misread", domain: "Craft & Structure", trap: "contrast misread" },
  { id: 3, label: "Strong/extreme wording", domain: "Information & Ideas", trap: "extreme language" },
];

// Example question (original text)
const SAMPLE_Q = {
  id: "rw-concision-0001",
  passage: `City officials promised to improve bus service; however, the new schedule, which was put into effect last month, has actually increased average wait times during the evening commute.`,
  stem: "Which choice best maintains the sentence's tone and concision?",
  choices: [
    { label: "A", text: "that was implemented in the month before this one" },
    { label: "B", text: "which was put into effect last month" },
    { label: "C", text: "which was newly put into effect during the last month of the year" },
    { label: "D", text: "implemented last month" },
  ],
  answer: "D",
  rationale: [
    { title: "Rule", text: "Prefer concise, precise phrasing that preserves meaning and tone." },
    { title: "Evidence", text: "All choices modify 'schedule.' The most concise equivalent to the underlined portion is 'implemented last month.'" },
    { title: "Eliminate", text: "A/C add unnecessary words; B is wordier than D without adding meaning." },
    { title: "Select", text: "D" },
  ],
  domain: "ExprOfIdeas",
  skill: "concision",
};

// Scores mock for Reports
const domainScores = [
  { domain: "Craft & Structure", score: 620 },
  { domain: "Information & Ideas", score: 590 },
  { domain: "Std Eng Conventions", score: 640 },
  { domain: "Expression of Ideas", score: 605 },
];

// ===== UI PRIMITIVES =====
function Chip({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-xs ${active ? "bg-black text-white border-black" : "bg-white hover:bg-neutral-50"}`}
    >
      {children}
    </button>
  );
}

// ===== LAYOUT =====
function TopNav({ onSettings }: { onSettings?: () => void }) {
  return (
    <div className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-black/90 text-white grid place-items-center font-semibold">S</div>
          <div>
            <p className="text-sm text-neutral-500 leading-none">SAT Prep</p>
            <h1 className="text-lg font-semibold leading-none">English Tutor & Generator</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">Beta</Badge>
          <Button variant="outline" size="sm" className="gap-2" onClick={onSettings}><Settings className="h-4 w-4"/> Settings</Button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ view, setView }: { view: string; setView: (v: string) => void }) {
  const items = [
    { icon: <BarChart3 className="h-4 w-4"/>, label: "Dashboard", key: "dashboard" },
    { icon: <BookOpen className="h-4 w-4"/>, label: "Practice", key: "practice" },
    { icon: <RotateCcw className="h-4 w-4"/>, label: "Review", key: "review" },
    { icon: <CheckCircle2 className="h-4 w-4"/>, label: "Simulation", key: "simulation" },
    { icon: <Wand2 className="h-4 w-4"/>, label: "WIC Trainer", key: "wic" },
    { icon: <BookOpen className="h-4 w-4"/>, label: "Lessons", key: "lessons" },
    { icon: <Settings className="h-4 w-4"/>, label: "Creator Mode", key: "creator" },
  ];
  return (
    <aside className="hidden md:block md:w-64 border-r min-h-[calc(100vh-56px)]">
      <div className="p-3">
        <div className="space-y-1">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setView(it.key)}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-neutral-50 ${view===it.key?"bg-neutral-50 border border-neutral-200":""}`}
            >
              {it.icon}
              <span className="text-sm">{it.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 p-3 rounded-2xl bg-neutral-50">
          <p className="text-xs text-neutral-500">Next up</p>
          <p className="text-sm font-medium">Module 1 • Reading & Writing</p>
          <Progress value={58} className="mt-2" />
          <p className="text-xs text-neutral-500 mt-1">58% mastered in this domain set</p>
        </div>
      </div>
    </aside>
  );
}

function MasteryChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Skill Mastery</CardTitle>
        <CardDescription>Track strengths and gaps by SAT domain</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RBarChart data={masteryData}>
            <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fillOpacity: 0.1 }} />
            <Bar dataKey="mastery" radius={[8, 8, 0, 0]} />
          </RBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function Dashboard({ setView }: { setView: (v: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Play className="h-4 w-4"/> Quick Practice</CardTitle>
            <CardDescription>Pick domain/skill • 10–20 Q • Timed/untimed</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setView("practice")}>Start</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4"/> Guided Lesson → Drill</CardTitle>
            <CardDescription>2–5 min lesson • 6–10 Q micro-drill</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setView("lessons")}>Browse Lessons</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-4 w-4"/> Full DSAT Simulation</CardTitle>
            <CardDescription>2 modules • adaptive routing • score report</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full" onClick={() => setView("simulation")}>Simulate</Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><MasteryChart /></div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Mistakes</CardTitle>
            <CardDescription>Click to generate variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mistakes.map(m => (
                <Badge key={m.id} variant="secondary" className="rounded-full cursor-pointer" onClick={() => setView("review")}>{m.label}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Design System Notes</CardTitle>
          <CardDescription>Tokens & components for consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
            <li>Typography: Inter/system; sizes: text-xs/sm/base/lg/xl/2xl.</li>
            <li>Spacing: Tailwind scale with generous card padding (p-4+).</li>
            <li>Corners: rounded-2xl; Shadows: subtle (shadow-sm/md); Borders: neutral-200.</li>
            <li>State: hover:bg-neutral-50; focus:ring-2 focus:ring-black/10.</li>
            <li>Badges = skills; Progress = module completion; Cards = tasks.</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Practice Setup =====
function PracticeSetup({ onStart }: { onStart: () => void }) {
  const [selectedDomains, setSelectedDomains] = useState<string[]>(["StdEngConv"]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["boundaries"]);
  const [timed, setTimed] = useState(true);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState(3);

  function toggle<T extends string>(arr: T[], val: T, setter: (v: T[]) => void) {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  function toggleDomain(id: string) {
    setSelectedDomains((prev) => {
      if (prev.includes(id)) {
        setSelectedSkills((skills) => skills.filter((sk) => !(SKILLS[id] || []).includes(sk)));
        return prev.filter((d) => d !== id);
      }
      return [...prev, id];
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Practice</CardTitle>
          <CardDescription>Select domains/skills and options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-2">Domains</p>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(d => (
                <Chip
                  key={d.id}
                  active={selectedDomains.includes(d.id)}
                  onClick={() => toggleDomain(d.id)}
                >
                  {d.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {selectedDomains.flatMap(d => SKILLS[d] || []).map(sk => (
                <Chip key={sk} active={selectedSkills.includes(sk)} onClick={() => toggle(selectedSkills, sk, setSelectedSkills)}>{sk}</Chip>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium"># Questions: {count}</label>
              <input type="range" min={5} max={30} value={count} onChange={(e)=>setCount(parseInt(e.target.value))} className="w-full"/>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty: {difficulty}</label>
              <input type="range" min={1} max={5} value={difficulty} onChange={(e)=>setDifficulty(parseInt(e.target.value))} className="w-full"/>
            </div>
            <div className="flex items-end">
              <Button variant={timed?"default":"outline"} onClick={()=>setTimed(!timed)} className="w-full flex items-center gap-2"><Clock className="h-4 w-4"/> {timed?"Timed":"Untimed"}</Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="gap-2" onClick={onStart}><Play className="h-4 w-4"/> Start Practice</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Question View =====
function QuestionView({ onFinish }: { onFinish?: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [elims, setElims] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = submitted && selected === SAMPLE_Q.answer;

  function toggleElim(label: string) {
    const s = new Set(elims);
    s.has(label) ? s.delete(label) : s.add(label);
    setElims(s);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-neutral-600"><Clock className="h-4 w-4"/> 31:45 • Q 1 / 10</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1"><Flag className="h-4 w-4"/> Flag</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Single-Sentence Rhetoric (Concision)</CardTitle>
          <CardDescription>Domain: Expression of Ideas • Skill: concision</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-xl text-sm leading-relaxed">{SAMPLE_Q.passage}</div>
          <div className="text-sm font-medium">{SAMPLE_Q.stem}</div>
          <div className="space-y-2">
            {SAMPLE_Q.choices.map((c) => {
              const active = selected === c.label;
              const eliminated = elims.has(c.label);
              return (
                <div key={c.label} className={`flex items-start gap-2 p-3 rounded-xl border ${active?"border-black bg-black/[0.02]":"border-neutral-200"} ${eliminated?"opacity-50 line-through":""}`}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="choice" checked={active} onChange={()=>setSelected(c.label)} className="mt-1"/>
                    <Badge variant="secondary" className="rounded-full">{c.label}</Badge>
                  </div>
                  <div className="flex-1 text-sm">{c.text}</div>
                  <button onClick={()=>toggleElim(c.label)} className="text-xs px-2 py-1 rounded-full border hover:bg-neutral-50">{eliminated?"Undo":"Eliminate"}</button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2">
            {!submitted ? (
              <Button disabled={!selected} onClick={()=>setSubmitted(true)} className="gap-2"><Check className="h-4 w-4"/> Submit</Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className={`rounded-full ${isCorrect?"bg-green-600":"bg-red-600"}`}>{isCorrect?"Correct":"Incorrect"}</Badge>
                <Button variant="outline" onClick={onFinish} className="gap-2">Next <ChevronRight className="h-4 w-4"/></Button>
              </div>
            )}
            <div className="text-xs text-neutral-500">Avg time: 54s</div>
          </div>
        </CardContent>
      </Card>

      {submitted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Why?</CardTitle>
            <CardDescription>Structure-first explanation</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {SAMPLE_Q.rationale.map((r, i) => (
                <li key={i}><span className="font-medium">{r.title}:</span> {r.text}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ===== Lessons =====
function LessonsPage({ onOpenLesson }: { onOpenLesson: (id: string) => void }) {
  const lessons = [
    { id: "l1", title: "Sentence Boundaries", domain: "Std Eng Conventions", time: 4 },
    { id: "l2", title: "Purpose & Function", domain: "Craft & Structure", time: 5 },
    { id: "l3", title: "Transitions", domain: "Expression of Ideas", time: 3 },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-4">
      {lessons.map(l => (
        <Card key={l.id}>
          <CardHeader>
            <CardTitle className="text-base">{l.title}</CardTitle>
            <CardDescription>{l.domain} • {l.time} min</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={()=>onOpenLesson(l.id)}>Open</Button>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}

function LessonDetail({ onStartDrill }: { onStartDrill: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transitions: Choose the Relationship First</CardTitle>
          <CardDescription>Expression of Ideas • 5 minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-neutral-50 rounded-xl">Rule: Determine the logical relationship (addition, contrast, cause/effect) between clauses before choosing a connector.</div>
          <div className="p-3 rounded-xl border">
            <p className="font-medium mb-1">Worked example</p>
            <p className="mb-2">The lab results were promising; <em>however</em>, the sample size was small.</p>
            <p className="text-neutral-600">Signal: contrast. Acceptable connectors: however, nevertheless, still.</p>
          </div>
          <div className="p-3 rounded-xl border">
            <p className="font-medium mb-1">Common trap</p>
            <p className="text-neutral-600">Picking a transition that matches the sentence topic but not the clause relationship.</p>
          </div>
          <Button className="gap-2" onClick={onStartDrill}><Play className="h-4 w-4"/> Start 6‑question drill</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== WIC Trainer =====
function WICTrainer() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const lemma = {
    word: "temperate",
    sentence: "Despite the sensational headlines, the analyst's tone remained ___, emphasizing measured expectations.",
    choices: [
      { label: "A", text: "incendiary" },
      { label: "B", text: "temperate" },
      { label: "C", text: "histrionic" },
      { label: "D", text: "bombastic" },
    ],
    answer: "B",
  };
  const correct = submitted && selected === lemma.answer;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">Daily WIC • 1 / 10</div>
        <Badge variant="secondary" className="rounded-full">Streak: 5</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meaning in Context</CardTitle>
          <CardDescription>Choose the word that best fits the context.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-xl text-sm">{lemma.sentence}</div>
          <div className="space-y-2">
            {lemma.choices.map(c => (
              <label key={c.label} className={`flex items-center gap-2 p-3 rounded-xl border ${selected===c.label?"border-black":"border-neutral-200"}`}>
                <input type="radio" name="wic" checked={selected===c.label} onChange={()=>setSelected(c.label)} />
                <Badge variant="secondary" className="rounded-full">{c.label}</Badge>
                <span className="text-sm">{c.text}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between">
            {!submitted ? (
              <Button disabled={!selected} onClick={()=>setSubmitted(true)} className="gap-2"><Check className="h-4 w-4"/> Submit</Button>
            ) : (
              <Badge className={`rounded-full ${correct?"bg-green-600":"bg-red-600"}`}>{correct?"Correct":"Incorrect"}</Badge>
            )}
            <Button variant="outline">Next</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Simulation =====
function SimulationPage() {
  const [started, setStarted] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full DSAT Simulation — Reading & Writing</CardTitle>
          <CardDescription>2 modules • 27 Q each • 32:00 per module</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!started ? (
            <Button onClick={()=>setStarted(true)} className="gap-2"><Play className="h-4 w-4"/> Start Module 1</Button>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-neutral-600"><Clock className="h-4 w-4"/> 32:00</div>
                <div className="text-sm">Module 1 • Q 1/27</div>
              </div>
              <Progress value={4} />
              <div className="p-3 rounded-xl border text-sm text-neutral-600">Practice-only shell. Wire this to your form delivery engine.</div>
              <div className="flex gap-2">
                <Button variant="outline">Previous</Button>
                <Button>Next</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Review / Error Log =====
function ReviewPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const data = mistakes;
  const filtered = filter ? data.filter(m => m.domain.includes(filter)) : data;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review / Error Log</CardTitle>
          <CardDescription>Filter by domain or trap and retry variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Chip active={!filter} onClick={()=>setFilter(null)}>All</Chip>
            {DOMAINS.map(d => (
              <Chip key={d.id} active={filter===d.label} onClick={()=>setFilter(d.label)}>{d.label}</Chip>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs text-neutral-500">{m.domain} • Trap: {m.trap}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1"><Wand2 className="h-4 w-4"/> Retry variants</Button>
                  <Button size="sm">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Reports =====
function ReportsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Domain Scores (estimate)</CardTitle>
          <CardDescription>Scaled 120–800</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart data={domainScores}>
              <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fillOpacity: 0.1 }} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next Steps</CardTitle>
          <CardDescription>Auto‑generated from your mistakes</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>Lesson: Sentence Boundaries → then 6‑Q drill</li>
            <li>Drill: Transitions (contrast vs. addition) • 10 Q</li>
            <li>WIC: temperate, pragmatic, opaque — new contexts</li>
          </ul>
          <div className="mt-3 flex gap-2">
            <Button variant="outline">Open Lesson</Button>
            <Button>Start Drill</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Creator Mode =====
function CreatorMode() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Content</CardTitle>
          <CardDescription>Questions • Lessons • WIC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-2xl text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">Drop files here</div>
              <div className="text-neutral-500">CSV / JSON / HTML / PDF</div>
            </div>
            <Button className="gap-2"><Upload className="h-4 w-4"/> Choose File</Button>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 text-sm">After upload: normalize → auto‑tag → QA → approve. Licensing metadata required.</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tagging Queue</CardTitle>
          <CardDescription>Approve domain, skills, difficulty, rationale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="p-3 rounded-xl border">
              <div className="text-sm font-medium mb-1">Item #{i} — Std Eng Conventions → boundaries</div>
              <div className="text-xs text-neutral-600 mb-2">Proposed: domain=StdEngConv • skills=[boundaries] • difficulty=3</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Edit</Button>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Root Page =====
export default function SATPrepUIFramework() {
  const [view, setView] = useState<string>("dashboard");

  return (
    <div className="min-h-screen bg-neutral-25">
      <TopNav />
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-4">
        <Sidebar view={view} setView={setView} />
        <main className="py-4">
          {view === "dashboard" && <Dashboard setView={setView} />}
          {view === "practice" && <PracticeSetup onStart={() => setView("question")} />}
          {view === "question" && <QuestionView onFinish={() => setView("practice")} />}
          {view === "lessons" && <LessonsPage onOpenLesson={() => setView("lesson-detail")} />}
          {view === "lesson-detail" && <LessonDetail onStartDrill={() => setView("question")} />}
          {view === "wic" && <WICTrainer />}
          {view === "simulation" && <SimulationPage />}
          {view === "review" && <ReviewPage />}
          {view === "reports" && <ReportsPage />}
          {view === "creator" && <CreatorMode />}
        </main>
      </div>
    </div>
  );
}
