"use client";

import { useState, useMemo, useEffect } from "react";
import type { Person } from "@/lib/types";
import { PersonInputForm } from "@/components/person-input-form";
import { AgeDistanceGrid } from "@/components/age-distance-grid";
import { AffiliationFinder } from "@/components/affiliation-finder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAge } from "@/lib/dates";
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

const generateInitialPeople = (count: number): Person[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    name: "",
    dob: "",
  }));
};

export default function Home() {
  const [people, setPeople] = useState<Person[]>(() => generateInitialPeople(5));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePeopleChange = (updatedPeople: Person[]) => {
    const processedPeople = updatedPeople.map((person) => {
      if (person.dob) {
        const ageResult = calculateAge(person.dob);
        if (ageResult) {
          return { ...person, age: ageResult.age, dob: ageResult.formattedDob, errors: undefined };
        }
        return { ...person, age: undefined, errors: { ...person.errors, dob: "Invalid date" } };
      }
      return { ...person, age: undefined };
    });
    setPeople(processedPeople);
  };
  
  const validPeople = useMemo(() => people.filter(p => p.name && p.age !== undefined), [people]);
  const validDobs = useMemo(() => validPeople.map(p => p.dob).filter((dob): dob is string => !!dob), [validPeople]);

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
          <CardTitle>Age Distance Grid</CardTitle>
          <CardDescription>Visualizing the age differences in years between group members.</CardDescription>
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

      <Card className="shadow-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle>AI Affiliation Finder</CardTitle>
          <CardDescription>Discover potential group affiliations based on shared generational experiences.</CardDescription>
        </CardHeader>
        <CardContent>
          {validDobs.length > 0 ? (
            <AffiliationFinder dobs={validDobs} />
          ) : (
             <div className="flex items-center justify-center h-24 text-center text-muted-foreground">
              <p>Enter at least one valid date of birth to use the AI finder.</p>
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
