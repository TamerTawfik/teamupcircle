/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { analyzeRepositories } from "@/app/actions/github";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
} from "recharts";
import {
  AlertTriangle,
  Github,
  Star,
  GitFork,
  Activity,
  Code,
  ShieldCheck,
  Loader2,
  BarChart,
  TrendingUp,
} from "lucide-react";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface RepositoryAnalysisProps {
  username: string;
}

type AnalysisData = any;

const CHART_COLORS = [
  "#36A2EB",
  "#FF6384",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#00CC99",
  "#FF6666",
  "#6666FF",
  "#FFCC66",
  "#C9CBCF",
  "#7DB3FF",
  "#F59B71",
  "#83D0C9",
  "#BAA1FF",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  type: "language" | "technology" | "radar";
}

const CustomTooltip = ({ active, payload, type }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const name = payload[0].name;

    let content = null;

    if (type === "language") {
      const percentage = data.percent;
      content = (
        <>
          <p className="label font-semibold">{`${name}`}</p>
          <p className="intro">{`Percentage: ${
            percentage?.toFixed(1) ?? 0
          }%`}</p>
        </>
      );
    } else if (type === "technology") {
      content = (
        <>
          <p className="label font-semibold">{`${name}`}</p>
          <p className="intro">{`Repositories: ${value}`}</p>
        </>
      );
    } else if (type === "radar") {
      content = (
        <>
          <p className="label font-semibold">{`${name}`}</p>
          <p className="intro">{`Score: ${value.toFixed(0)} / 100`}</p>
        </>
      );
    }

    return (
      <div className="p-2 text-sm bg-background border border-border rounded shadow-lg text-foreground">
        {content}
      </div>
    );
  }

  return null;
};

export function RepositoryAnalysis({ username }: RepositoryAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const initialFetch = async () => {
      if (username && !analysis) {
        console.log("Attempting initial data fetch for:", username);
        setIsLoading(true);
        setError(null);
        setIsInitialLoad(true);
        try {
          const result = await analyzeRepositories(username);
          console.log(
            "Initial fetch result:",
            result ? "Data received" : "No data"
          );
          setAnalysis(result);
        } catch (err) {
          console.error("Initial fetch frontend error:", err);
          setError(
            err instanceof Error
              ? err.message
              : "An unknown error occurred during initial data load"
          );
        } finally {
          setIsLoading(false);
          setIsInitialLoad(false);
        }
      } else {
        setIsInitialLoad(false);
      }
    };

    initialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // const handleAnalyze = async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const result = await analyzeRepositories(username);
  //     setAnalysis(result);
  //   } catch (err) {
  //     console.error("Manual analysis frontend error:", err);
  //     setError(
  //       err instanceof Error
  //         ? err.message
  //         : "An unknown error occurred during analysis"
  //     );
  //     setAnalysis(null);
  //   } finally {
  //     setIsLoading(false);
  //     setIsInitialLoad(false);
  //   }
  // };

  const languageChartData = useMemo(() => {
    if (!analysis?.languageDistribution) return [];
    const distribution = analysis.languageDistribution as Record<
      string,
      number
    >;
    const totalBytes = Object.values(distribution).reduce(
      (sum: number, val: number) => sum + val,
      0
    );
    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value: value as number,
        percent: totalBytes > 0 ? ((value as number) / totalBytes) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [analysis?.languageDistribution]);

  const technologyChartData = useMemo(() => {
    if (!analysis?.technologyUsage) return [];
    return Object.entries(analysis.technologyUsage)
      .map(([name, value]) => ({
        name,
        value: value as number,
      }))
      .sort((a, b) => b.value - a.value);
  }, [analysis?.technologyUsage]);

  const curismRadarChartData = useMemo(() => {
    if (!analysis?.averageCurismFactors) return [];
    const factors = analysis.averageCurismFactors;
    return [
      {
        subject: "Contribution",
        score: factors.contribution ?? 0,
        fullMark: 100,
      },
      {
        subject: "Reliability",
        score: factors.reliability ?? 0,
        fullMark: 100,
      },
      { subject: "Influence", score: factors.influence ?? 0, fullMark: 100 },
      { subject: "Security", score: factors.security ?? 0, fullMark: 100 },
      {
        subject: "Maintainability",
        score: factors.maintainability ?? 0,
        fullMark: 100,
      },
    ];
  }, [analysis?.averageCurismFactors]);

  const getQualityScoreColorClass = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    if (value >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressScoreColorClass = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    if (value >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getAcidScoreColorClass = (value: number) => {
    if (value >= 75) return "text-green-600";
    if (value >= 50) return "text-yellow-600";
    if (value >= 25) return "text-orange-600";
    return "text-red-600";
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repos</CardTitle>
            <Github className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis?.totalRepos ?? "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analysis?.analyzedReposCount ?? 0} analyzed in detail
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis?.totalStars ?? "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all public repositories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
            <GitFork className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis?.totalForks ?? "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all public repositories
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Language Distribution</CardTitle>
          <CardDescription>
            Based on bytes of code in {analysis?.analyzedReposCount ?? 0}{" "}
            analyzed repositories (by percentage)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80 relative">
            {languageChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    innerRadius="40%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {languageChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="hsl(var(--background))"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<CustomTooltip type="language" />}
                  />
                  <RechartsLegend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconSize={10}
                    wrapperStyle={{
                      fontSize: "0.8rem",
                      lineHeight: "1.2",
                      paddingLeft: "15px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No language data found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Quality Setup (Heuristic)</CardTitle>
          <CardDescription>
            Average scores based on project setup in analyzed repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(
            [
              "Best Practices",
              "Test Setup",
              "Documentation",
              "Security Setup",
            ] as const
          ).map((label) => {
            const scoreKey = `avg${label.replace(
              " ",
              ""
            )}Score` as keyof AnalysisData["aggregatedCodeQuality"];
            const score = analysis?.aggregatedCodeQuality?.[scoreKey] ?? 0;
            return (
              <div key={label} className="flex flex-col items-center space-y-2">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div
                  className={`text-xl py-2 font-bold ${getQualityScoreColorClass(
                    score
                  )}`}
                >
                  {Math.round(score)}%
                </div>
                <Progress
                  value={score}
                  className={cn("h-2 w-full", {
                    "[&>div]:bg-green-500": score >= 80,
                    "[&>div]:bg-yellow-500": score >= 50 && score < 80,
                    "[&>div]:bg-red-500": score < 50,
                  })}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Technology Usage</CardTitle>
          <CardDescription>
            Detected libraries, frameworks, and tools in{" "}
            {analysis?.analyzedReposCount ?? 0} analyzed repositories (by count)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80 relative">
            {technologyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={technologyChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ cx, cy, midAngle, outerRadius, value, name }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius * 1.2;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#666"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          className="text-xs"
                        >
                          {name} ({value})
                        </text>
                      );
                    }}
                  >
                    {technologyChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          CHART_COLORS.slice().reverse()[
                            index % CHART_COLORS.length
                          ]
                        }
                        stroke="hsl(var(--background))"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<CustomTooltip type="technology" />}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No specific technologies detected in dependencies or config
                files.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Repositories by Stars</CardTitle>
          <CardDescription>
            From the {analysis?.analyzedReposCount ?? 0} analyzed repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(analysis?.topRepositories ?? []).length > 0 ? (
            analysis?.topRepositories.map((repo: any, index: number) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start gap-2">
                  <a
                    href={`https://github.com/${username}/${repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-md font-medium text-primary hover:underline mb-1 line-clamp-1 break-all"
                    title={repo.name}
                  >
                    {repo.name}
                  </a>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Dialog>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <span className="text-xs font-semibold bg-muted px-1.5 py-0.5 rounded cursor-pointer hover:bg-muted/80 transition-colors">
                              ACID: {repo.curismScore ?? "N/A"}{" "}
                            </span>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p>Overall ACID Score (0-100)</p>
                          <p className="text-muted-foreground">
                            Click for A/C/I/D breakdown.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            ACID Score Details: {repo.name}
                          </DialogTitle>
                          <DialogDescription>
                            Scores based on repository analysis (0-100).
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 py-4">
                          <div className="font-medium">Architecture (A)</div>
                          <div
                            className={`font-semibold ${getAcidScoreColorClass(
                              repo.acidScores?.architecture ?? 0
                            )}`}
                          >
                            {repo.acidScores?.architecture ?? "N/A"}
                          </div>
                          <div className="font-medium">Cross-Domain (C)</div>
                          <div
                            className={`font-semibold ${getAcidScoreColorClass(
                              repo.acidScores?.crossDomain ?? 0
                            )}`}
                          >
                            {repo.acidScores?.crossDomain ?? "N/A"}
                          </div>
                          <div className="font-medium">Innovation (I)</div>
                          <div
                            className={`font-semibold ${getAcidScoreColorClass(
                              repo.acidScores?.innovation ?? 0
                            )}`}
                          >
                            {repo.acidScores?.innovation ?? "N/A"}
                          </div>
                          <div className="font-medium">Documentation (D)</div>
                          <div
                            className={`font-semibold ${getAcidScoreColorClass(
                              repo.acidScores?.documentation ?? 0
                            )}`}
                          >
                            {repo.acidScores?.documentation ?? "N/A"}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Updated{" "}
                      {formatDistanceToNow(new Date(repo.lastUpdated), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {repo.description || "No description provided"}
                </p>
                <div className="flex flex-wrap mt-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-500 mr-1" />{" "}
                    <span>{repo.stars} Stars</span>{" "}
                  </div>
                  <div className="flex items-center">
                    <GitFork size={14} className="text-green-500 mr-1" />{" "}
                    <span>{repo.forks} Forks</span>{" "}
                  </div>
                  {repo.primaryLanguage && (
                    <div className="flex items-center">
                      <Code size={14} className="text-blue-500 mr-1" />{" "}
                      <span>{repo.primaryLanguage}</span>{" "}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No repositories with stars found in the analyzed set.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderActivityTab = () => (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contributions (Last Year)
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {analysis?.commitActivity?.totalContributionsLastYear ?? "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                Via GitHub contribution graph
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Longest Streak
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {analysis?.commitActivity?.longestStreak ?? "-"} Days
              </div>
              <p className="text-xs text-muted-foreground">
                Consecutive contribution days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Streak
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {analysis?.commitActivity?.currentStreak ?? "-"} Days
              </div>
              <p className="text-xs text-muted-foreground">
                Active contribution streak
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Heatmap</CardTitle>
            <CardDescription>
              Activity over the last year (from GitHub)
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {(analysis?.contributionGraph ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-0.5 justify-center">
                {analysis?.contributionGraph.map((day: any, index: number) => (
                  <Tooltip key={index} delayDuration={50}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-3 h-3 rounded-sm cursor-pointer"
                        style={{
                          backgroundColor:
                            day.count === 0
                              ? "hsl(var(--muted) / 0.3)"
                              : day.count < 3
                                ? "#9be9a8"
                                : day.count < 7
                                  ? "#40c463"
                                  : day.count < 12
                                    ? "#30a14e"
                                    : "#216e39",
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>{`${day.date}: ${day.count} contribution${
                        day.count !== 1 ? "s" : ""
                      }`}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Could not load contribution heatmap data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );

  const renderQualityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Average CURISM Factors</CardTitle>
          <CardDescription>
            Average scores (Contribution, Reliability, Influence, Security,
            Maintainability) across {analysis?.analyzedReposCount ?? 0} analyzed
            repositories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 md:h-96 relative">
            {curismRadarChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={curismRadarChartData}
                >
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    axisLine={false}
                    tick={false}
                  />
                  <RechartsRadar
                    name="Average Score"
                    dataKey="score"
                    stroke={CHART_COLORS[1]}
                    fill={CHART_COLORS[1]}
                    fillOpacity={0.6}
                  />
                  <RechartsLegend
                    iconSize={10}
                    wrapperStyle={{ fontSize: "0.8rem" }}
                  />
                  <RechartsTooltip content={<CustomTooltip type="radar" />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No CURISM factor data available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>CURISM Factors Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of each CURISM factor across analyzed
            repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="font-light tex-sm">Contribution</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recent activity and engagement
                  </p>
                </div>
                <div className="text-md font-bold">
                  {analysis?.averageCurismFactors?.contribution ?? 0}%
                </div>
              </div>
              <Progress
                value={analysis?.averageCurismFactors?.contribution ?? 0}
                className={cn(
                  "h-2",
                  getProgressScoreColorClass(
                    analysis?.averageCurismFactors?.contribution ?? 0
                  )
                )}
              />

              <div className="flex items-center justify-between mt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-light tex-sm">Reliability</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Code testing and stability
                  </p>
                </div>
                <div className="text-md font-bold">
                  {analysis?.averageCurismFactors?.reliability ?? 0}%
                </div>
              </div>
              <Progress
                value={analysis?.averageCurismFactors?.reliability ?? 0}
                className={cn(
                  "h-2",
                  getProgressScoreColorClass(
                    analysis?.averageCurismFactors?.reliability ?? 0
                  )
                )}
              />

              <div className="flex items-center justify-between mt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span className="font-light tex-sm">Influence</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Project impact and adoption
                  </p>
                </div>
                <div className="text-md font-bold">
                  {analysis?.averageCurismFactors?.influence ?? 0}%
                </div>
              </div>
              <Progress
                value={analysis?.averageCurismFactors?.influence ?? 0}
                className={cn(
                  "h-2",
                  getProgressScoreColorClass(
                    analysis?.averageCurismFactors?.influence ?? 0
                  )
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-light tex-sm">Security</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Security practices and measures
                  </p>
                </div>
                <div className="text-md font-bold">
                  {analysis?.averageCurismFactors?.security ?? 0}%
                </div>
              </div>
              <Progress
                value={analysis?.averageCurismFactors?.security ?? 0}
                className={cn(
                  "h-2",
                  getProgressScoreColorClass(
                    analysis?.averageCurismFactors?.security ?? 0
                  )
                )}
              />

              <div className="flex items-center justify-between mt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="font-light tex-sm">Maintainability</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Code quality and documentation
                  </p>
                </div>
                <div className="text-md font-bold">
                  {analysis?.averageCurismFactors?.maintainability ?? 0}%
                </div>
              </div>
              <Progress
                value={analysis?.averageCurismFactors?.maintainability ?? 0}
                className={cn(
                  "h-2",
                  getProgressScoreColorClass(
                    analysis?.averageCurismFactors?.maintainability ?? 0
                  )
                )}
              />

              <div className="flex items-center justify-between mt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-light tex-sm">Overall Score</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average of all CURISM factors
                  </p>
                </div>
                <div className="text-md font-bold">
                  {Math.round(
                    ((analysis?.averageCurismFactors?.contribution ?? 0) +
                      (analysis?.averageCurismFactors?.reliability ?? 0) +
                      (analysis?.averageCurismFactors?.influence ?? 0) +
                      (analysis?.averageCurismFactors?.security ?? 0) +
                      (analysis?.averageCurismFactors?.maintainability ?? 0)) /
                      5
                  )}
                  %
                </div>
              </div>
              <Progress
                value={Math.round(
                  ((analysis?.averageCurismFactors?.contribution ?? 0) +
                    (analysis?.averageCurismFactors?.reliability ?? 0) +
                    (analysis?.averageCurismFactors?.influence ?? 0) +
                    (analysis?.averageCurismFactors?.security ?? 0) +
                    (analysis?.averageCurismFactors?.maintainability ?? 0)) /
                    5
                )}
                className={cn(
                  "h-2",
                  getProgressScoreColorClass(
                    Math.round(
                      ((analysis?.averageCurismFactors?.contribution ?? 0) +
                        (analysis?.averageCurismFactors?.reliability ?? 0) +
                        (analysis?.averageCurismFactors?.influence ?? 0) +
                        (analysis?.averageCurismFactors?.security ?? 0) +
                        (analysis?.averageCurismFactors?.maintainability ??
                          0)) /
                        5
                    )
                  )
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <TooltipProvider>
      <Card className="w-full border-none bg-transparent shadow-none">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl">Repositories Analysis</CardTitle>
            <CardDescription>
              Analysis for{" "}
              <span className="font-semibold text-primary-foreground">
                {username}
              </span>
              {analysis?.analysisTimestamp && (
                <span className="text-xs ml-2 text-muted-foreground">
                  (Data as of:{" "}
                  {formatDistanceToNow(new Date(analysis.analysisTimestamp), {
                    addSuffix: true,
                  })}
                  )
                </span>
              )}
            </CardDescription>
          </div>
          {/* <Button onClick={handleAnalyze} disabled={isLoading} size="sm">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Analyzing..." : analysis ? "Re-Scan " : "Scan "}
          </Button> */}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex flex-col justify-center items-center p-12 space-y-4 min-h-[300px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="text-muted-foreground">
                {isInitialLoad
                  ? "Loading analysis data..."
                  : "Analyzing repositories..."}
              </span>
              {!isInitialLoad && (
                <span className="text-muted-foreground text-sm text-center">
                  This may involve several GitHub API calls and can take a
                  moment.
                </span>
              )}
            </div>
          )}

          {!isLoading && analysis && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="quality">CURISM</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                {renderOverviewTab()}
              </TabsContent>
              <TabsContent value="details" className="mt-4">
                {renderDetailsTab()}
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                {renderActivityTab()}
              </TabsContent>
              <TabsContent value="quality" className="mt-4">
                {renderQualityTab()}
              </TabsContent>
            </Tabs>
          )}

          {!isLoading && !analysis && !error && (
            <div className="text-center text-muted-foreground p-8 border rounded-md min-h-[300px] flex items-center justify-center">
              <span>
                No analysis data found for &apos;{username}&apos;. Click{" "}
                <strong>Scan Repositories</strong> to perform an initial
                analysis.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
