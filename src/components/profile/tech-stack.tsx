/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useCallback,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Download } from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TechStackProps {
  username: string;
  initialData: any;
}

export function TechStack({ username, initialData }: TechStackProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify(initialData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${username}-tech-stack.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [initialData, username]);

  // Format data for Recharts
  const pieChartData = initialData.pieChartData.map(
    (item: { name: any; size: any; color: any }) => ({
      name: item.name,
      value: item.size,
      color: item.color,
    })
  );

  const experienceData = initialData.languageExperience.map(
    (lang: {
      name: any;
      yearsOfExperience: any;
      frameworks: any;
      color: any;
    }) => ({
      name: lang.name,
      years: lang.yearsOfExperience,
      frameworks: lang.frameworks,
      color: lang.color,
    })
  );

  const lineChartData = initialData.timelineChartData.map(
    (yearData: { year: number; [key: string]: any }) => ({
      year: yearData.year,
      ...Object.entries(yearData)
        .filter(([key]) => key !== "year")
        .reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: Number((value / 1024 / 1024).toFixed(1)),
          }),
          {}
        ),
    })
  );

  const languages = Object.keys(lineChartData[0] || {}).filter(
    (key) => key !== "year"
  );
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff0000"];

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Tech Stack Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Analysis based on {initialData.totalRepos} repositories with{" "}
            {initialData.totalStars} total stars
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {initialData.languageExperience
              .slice(0, 4)
              .map(
                (lang: {
                  name:
                    | boolean
                    | Key
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  color: any;
                  yearsOfExperience:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  frameworks: any[];
                }) => (
                  <Card key={String(lang.name)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {lang.name}
                      </CardTitle>
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {lang.yearsOfExperience} years
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lang.frameworks.length > 0
                          ? `${lang.frameworks.join(", ")}`
                          : "No frameworks detected"}
                      </p>
                    </CardContent>
                  </Card>
                )
              )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Based on code size in bytes</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map(
                        (entry: { color: string | undefined }, index: any) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        `${(value / 1024 / 1024).toFixed(1)} MB`
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Years of Experience</CardTitle>
                <CardDescription>Experience per language</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={experienceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      label={{
                        value: "Years",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Bar dataKey="years">
                      {experienceData.map(
                        (entry: { color: string | undefined }, index: any) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technology Experience</CardTitle>
              <CardDescription>
                Detailed breakdown of experience and frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {initialData.languageExperience.map(
                  (lang: {
                    name:
                      | boolean
                      | Key
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    color: any;
                    yearsOfExperience:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    frameworks: any[];
                  }) => (
                    <div key={String(lang.name)} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: lang.color }}
                        />
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-muted-foreground">
                          ({lang.yearsOfExperience} years)
                        </span>
                      </div>
                      {lang.frameworks.length > 0 && (
                        <div className="ml-5 flex flex-wrap gap-2">
                          {lang.frameworks.map((framework) => (
                            <span
                              key={framework}
                              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium"
                            >
                              {framework}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Evolution</CardTitle>
              <CardDescription>
                How your technology usage has evolved over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    label={{
                      value: "Size (MB)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  {languages.map((language, index) => (
                    <Bar
                      key={language}
                      dataKey={language}
                      fill={COLORS[index % COLORS.length]}
                      stackId="a"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>
                Complete breakdown of your tech stack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {initialData.languageExperience.map(
                  (lang: {
                    name:
                      | boolean
                      | Key
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    color: any;
                    size: number;
                    yearsOfExperience:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    frameworks: any[];
                  }) => (
                    <div key={String(lang.name)} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: lang.color }}
                          />
                          <span className="font-medium">{lang.name}</span>
                        </div>
                        <span className="font-mono">
                          {(lang.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="ml-5 text-sm text-muted-foreground">
                        <p>Experience: {lang.yearsOfExperience} years</p>
                        {lang.frameworks.length > 0 && (
                          <p>Frameworks: {lang.frameworks.join(", ")}</p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function TechStackError({ error }: { error: Error }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message || "Failed to load tech stack data"}
      </AlertDescription>
    </Alert>
  );
}

export function TechStackSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px]" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px]" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
