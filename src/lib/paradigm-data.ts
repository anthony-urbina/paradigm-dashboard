export type LeaderboardEntry = {
  rank: number;
  name: string;
  subtitle: string;
  value: string;
  badge?: string;
  tone?: "gold" | "accent";
  progressLabel?: string;
  progressValue?: number;
};

export const weeklyLeaders: LeaderboardEntry[] = [
  { rank: 1, name: "Dominick Scalice", subtitle: "9 sales", value: "$19,178", badge: "(you)", tone: "gold" },
  { rank: 2, name: "Trey Tyree", subtitle: "7 sales", value: "$17,105" },
  { rank: 3, name: "Vernon Baker", subtitle: "8 sales", value: "$16,453", tone: "accent" },
  { rank: 4, name: "Brendan Horsman", subtitle: "7 sales", value: "$15,235" },
  { rank: 5, name: "Nick Dambruoso", subtitle: "5 sales", value: "$11,799" },
  { rank: 6, name: "Daniel Gvili", subtitle: "7 sales", value: "$11,164" },
  { rank: 7, name: "Dominique Green", subtitle: "4 sales", value: "$9,538" },
  { rank: 8, name: "Thomas Hayes", subtitle: "6 sales", value: "$9,153" },
  { rank: 9, name: "Kobe Saintfort", subtitle: "5 sales", value: "$7,111" },
  { rank: 10, name: "Marcus Turo", subtitle: "6 sales", value: "$5,807" },
];

export const monthlyLeaders: LeaderboardEntry[] = [
  { rank: 1, name: "Trey Tyree", subtitle: "29 sales", value: "$63,910", tone: "gold" },
  { rank: 2, name: "Dominick Scalice", subtitle: "16 sales", value: "$35,577", badge: "(you)", tone: "accent" },
  { rank: 3, name: "Kobe Saintfort", subtitle: "18 sales", value: "$27,885", tone: "accent" },
  { rank: 4, name: "Nick Dambruoso", subtitle: "13 sales", value: "$27,547" },
  { rank: 5, name: "Brendan Horsman", subtitle: "18 sales", value: "$27,091" },
  { rank: 6, name: "Vernon Baker", subtitle: "14 sales", value: "$25,228" },
  { rank: 7, name: "Daniel Gvili", subtitle: "15 sales", value: "$23,836" },
  { rank: 8, name: "Thomas Hayes", subtitle: "12 sales", value: "$17,372" },
  { rank: 9, name: "Dominique Green", subtitle: "9 sales", value: "$16,416" },
  { rank: 10, name: "Marcus Turo", subtitle: "14 sales", value: "$16,082" },
];

export const agencyAgents: LeaderboardEntry[] = [
  { rank: 1, name: "Trey Tyree", subtitle: "29 sales", value: "$63,910", tone: "gold", progressLabel: "100% of $60,000", progressValue: 100 },
  { rank: 2, name: "Dominick Scalice", subtitle: "16 sales", value: "$35,577", badge: "(you)", tone: "accent", progressLabel: "59% of $60,000", progressValue: 59 },
  { rank: 3, name: "Kobe Saintfort", subtitle: "18 sales", value: "$27,885", tone: "accent", progressLabel: "46% of $60,000", progressValue: 46 },
  { rank: 4, name: "Nick Dambruoso", subtitle: "13 sales", value: "$27,547", progressLabel: "46% of $60,000", progressValue: 46 },
  { rank: 5, name: "Brendan Horsman", subtitle: "18 sales", value: "$27,091", progressLabel: "54% of $50,000", progressValue: 54 },
  { rank: 6, name: "Vernon Baker", subtitle: "14 sales", value: "$25,228" },
  { rank: 7, name: "Daniel Gvili", subtitle: "15 sales", value: "$23,836" },
  { rank: 8, name: "Thomas Hayes", subtitle: "12 sales", value: "$17,372" },
  { rank: 9, name: "Dominique Green", subtitle: "9 sales", value: "$16,416", progressLabel: "59% of $28,000", progressValue: 59 },
  { rank: 10, name: "Marcus Turo", subtitle: "14 sales", value: "$16,082", progressLabel: "49% of $34,000", progressValue: 49 },
];

export const agencyTeams: LeaderboardEntry[] = [
  { rank: 1, name: "AJ Standish", subtitle: "9 writing agents · 56 sales", value: "$86,939", tone: "gold", progressLabel: "43% of $200,000", progressValue: 43 },
  { rank: 2, name: "Trey Tyree", subtitle: "3 writing agents · 39 sales", value: "$81,526" },
  { rank: 3, name: "Nick Dambruoso", subtitle: "5 writing agents · 37 sales", value: "$67,006", tone: "accent", progressLabel: "67% of $100,000", progressValue: 67 },
  { rank: 4, name: "Brendan Horsman", subtitle: "4 writing agents · 38 sales", value: "$56,367", progressLabel: "75% of $75,000", progressValue: 75 },
  { rank: 5, name: "Thomas Hayes", subtitle: "4 writing agents · 24 sales", value: "$34,025" },
  { rank: 6, name: "Kobe Saintfort", subtitle: "3 writing agents · 21 sales", value: "$30,862", progressLabel: "15% of $200,000", progressValue: 15 },
  { rank: 7, name: "Daniel Gvili", subtitle: "3 writing agents · 20 sales", value: "$29,276" },
  { rank: 8, name: "Vernon Baker", subtitle: "2 writing agents · 15 sales", value: "$27,390" },
  { rank: 9, name: "Marcus Turo", subtitle: "2 writing agents · 16 sales", value: "$23,683", progressLabel: "36% of $65,000", progressValue: 36 },
  { rank: 10, name: "Taylor Scalice", subtitle: "6 writing agents · 18 sales", value: "$23,476", progressLabel: "67% of $35,000", progressValue: 67 },
];

export const teamRows = [
  ["Trey Tyree", "You", "2", "$81,526", "$63,910", "29", "229", "30", "1", "25"],
  ["Dominick Scalice", "—", "13", "$410,499", "$35,577", "16", "581", "35", "14", "25"],
  ["Kobe Saintfort", "Nick Dambruoso", "2", "$30,862", "$27,885", "18", "1,597", "90", "18", "38"],
  ["Nick Dambruoso", "You", "2", "$67,006", "$27,547", "13", "34", "40", "0", "34"],
  ["Brendan Horsman", "AJ Standish", "2", "$56,367", "$27,091", "18", "277", "14", "16", "9"],
  ["Vernon Baker", "You", "4", "$27,390", "$25,228", "14", "2,902", "40", "7", "19"],
  ["Daniel Gvili", "Brendan Horsman", "2", "$29,276", "$23,836", "15", "0", "0", "0", "0"],
  ["Thomas Hayes", "You", "3", "$34,025", "$17,372", "12", "904", "21", "5", "32"],
  ["Dominique Green", "Trey Tyree", "3", "$17,616", "$16,416", "9", "55", "16", "0", "0"],
  ["Marcus Turo", "You", "1", "$23,683", "$16,082", "14", "540", "55", "52", "0"],
];

export const adminAgents = [
  ["Garrett Gittelman", "garrettgittelman@gmail.com", "$0", "0", "N", "Tag", "Stats only", "Unassigned", true],
  ["Trey Tyree", "treytyree@gmail.com", "$67,748", "31", "Y", "Paradigm", "Stats only", "Dominick Scalice", false],
  ["Dominick Scalice", "domscalice@gmail.com", "$38,094", "18", "Y", "Paradigm", "Admin", "Unassigned", false],
  ["Brendan Horsman", "brendanhorsman4@gmail.com", "$33,425", "21", "Y", "Paradigm", "Stats only", "AJ Standish", false],
  ["Nick Dambruoso", "nicholasd1441@gmail.com", "$32,899", "17", "Y", "Paradigm", "Stats only", "Dominick Scalice", false],
  ["Kobe Saintfort", "saintfortkobe@gmail.com", "$29,840", "19", "Y", "Paradigm", "Stats only", "Nick Dambruoso", false],
  ["Daniel Gvili", "daniel.gvili.02@gmail.com", "$26,237", "17", "N", "Paradigm", "Stats only", "Brendan Horsman", false],
  ["Vernon Baker", "vernonbakerffl@gmail.com", "$25,228", "14", "Y", "Paradigm", "Stats only", "Dominick Scalice", false],
  ["Thomas Hayes", "tommyalva123@gmail.com", "$20,086", "14", "Y", "Paradigm", "Stats only", "Dominick Scalice", false],
  ["Marcus Turo", "mturo.life@gmail.com", "$17,941", "16", "N", "Paradigm", "Stats only", "Dominick Scalice", false],
];

export const growthBars = [
  ["May", "$374,956", 32],
  ["June", "$46,335", 10],
  ["July", "$415,447", 38],
  ["August", "$449,947", 42],
  ["September", "$539,936", 50],
  ["October", "$647,923", 60],
  ["November", "$777,508", 72],
  ["December", "$1,343,534", 90],
];
