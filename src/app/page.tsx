"use client";

import { useState, useMemo, useEffect } from "react";
import type { Person } from "@/lib/types";
import { PersonInputForm } from "@/components/person-input-form";
import { AgeDistanceGrid } from "@/components/age-distance-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAge } from "@/lib/dates";
import { getGeneration, generationCohorts } from "@/lib/generations";
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
import { Menu } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
