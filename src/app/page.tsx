"use client";

import { useState, useMemo, useEffect } from "react";
import type { Person } from "@/lib/types";
import { PersonInputForm } from "@/components/person-input-form";
import { AgeDistanceGrid } from "@/components/age-distance-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAge } from "@/lib/dates";
import { getGeneration, generationCohorts, type Generation } from "@/lib/generations";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [groupByGeneration, setGroupByGeneration] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePeopleChange = (updatedPeople: Person[]) => {
    const processedPeople = updatedPeople.map((person) => {
      if (person.dob) {
        const ageResult = calculateAge(person.dob);
        if (ageResult) {
          const generation = getGeneration(ageResult.year);
          return { ...person, age: ageResult.age, dob: ageResult.formattedDob, generation: generation ?? undefined, errors: undefined };
        }
        return { ...person, age: undefined, generation: undefined, errors: { ...person.errors, dob: "Invalid date" } };
      }
      return { ...person, age: undefined, generation: undefined };
    });
    setPeople(processedPeople);
  };
  
  const validPeople = useMemo(() => {
    const filtered = people.filter(p => p.name && p.age !== undefined);
    if (groupByGeneration) {
      return [...filtered].sort((a, b) => {
        if (!a.generation || !b.generation) return 0;

        const aCohort = generationCohorts.find(c => c.nickname === a.generation!.nickname);
        const bCohort = generationCohorts.find(c => c.nickname === b.generation!.nickname);
        
        if (aCohort && bCohort) {
          // Primary sort: descending by startYear to show newest generations first
          const generationSort = bCohort.startYear - aCohort.startYear;
          if (generationSort !== 0) {
            return generationSort;
          }

          // Secondary sort: ascending by age (youngest to oldest)
          const ageSort = (a.age ?? 0) - (b.age ?? 0);
          if (ageSort !== 0) {
            return ageSort;
          }

          // Tertiary sort: alphabetically by name
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
    }
    return filtered;
  }, [people, groupByGeneration]);

  if (!isClient) {
    return null;
  }

  const InputSection = () => (
    <PersonInputForm people={people} onPeopleChange={handlePeopleChange} />
  );

  const GenerationData = () => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Generation; direction: 'ascending' | 'descending' } | null>({ key: 'startYear', direction: 'descending' });

    const sortedCohorts = useMemo(() => {
      let sortableItems = [...generationCohorts];
      if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      return sortableItems;
    }, [sortConfig]);

    const requestSort = (key: keyof Generation) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof Generation) => {
      if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
      }
      if (sortConfig.direction === 'ascending') {
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
      }
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    };

    const SortableHeader = ({ columnKey, children, className }: { columnKey: keyof Generation; children: React.ReactNode; className?: string }) => (
      <TableHead className={cn("cursor-pointer hover:bg-muted/50 group", className)} onClick={() => requestSort(columnKey)}>
        <div className="flex items-center">
          {children}
          {getSortIndicator(columnKey)}
        </div>
      </TableHead>
    );

    return (
      <Card className="shadow-lg animate-fade-in mt-8">
        <CardHeader>
          <CardTitle>Generation Cohorts</CardTitle>
          <CardDescription>The data used to determine generational labels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>View Generation Data</AccordionTrigger>
              <AccordionContent>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortableHeader columnKey="name">Generation</SortableHeader>
                          <SortableHeader columnKey="nickname">Nickname</SortableHeader>
                          <SortableHeader columnKey="startYear">Birth Year Range</SortableHeader>
                          <SortableHeader columnKey="definingTrait">Defining Trait</SortableHeader>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedCohorts.map((cohort) => (
                          <TableRow key={cohort.name}>
                            <TableCell className="font-medium">{cohort.name}</TableCell>
                            <TableCell>{cohort.nickname}</TableCell>
                            <TableCell>{cohort.startYear} – {cohort.endYear}</TableCell>
                            <TableCell className="text-muted-foreground">{cohort.definingTrait}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  const OutputSection = () => (
    <div className="space-y-8">
      <Card className="shadow-lg animate-fade-in">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Age Distance Grid</CardTitle>
              <CardDescription>Visualizing the age differences in years between group members.</CardDescription>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="group-by-generation" checked={groupByGeneration} onCheckedChange={(checked) => setGroupByGeneration(!!checked)} />
              <Label htmlFor="group-by-generation">Group by Generation</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {validPeople.length >= 2 ? (
            <AgeDistanceGrid people={validPeople} />
          ) : (
            <div className="flex items-center justify-center h-40 text-center text-muted-foreground">
              <p>Enter at least two people with valid names and dates of birth to see the grid.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <GenerationData />
    </div>
  );

  return (
    <SidebarProvider>
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-sidebar-foreground">ChronoGrid</h2>
                    <SidebarTrigger />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <div className="p-2">
                    <InputSection />
                </div>
            </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-background">
            <header className="flex items-center justify-between p-4 border-b md:hidden sticky top-0 bg-background z-20">
                <h1 className="text-xl font-bold">ChronoGrid</h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Input</SheetTitle>
                        </SheetHeader>
                        <div className="py-4">
                           <InputSection />
                        </div>
                    </SheetContent>
                </Sheet>
            </header>
            <main className="p-4 md:p-8">
                <OutputSection />
                <footer className="text-center mt-12 text-muted-foreground text-sm">
                    <p>ChronoGrid &copy; {new Date().getFullYear()}</p>
                </footer>
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
