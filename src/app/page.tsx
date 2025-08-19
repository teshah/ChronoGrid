"use client";

import { useState, useMemo, useEffect } from "react";
import type { Person } from "@/lib/types";
import { PersonInputForm } from "@/components/person-input-form";
import { AgeDistanceGrid } from "@/components/age-distance-grid";
import { AffiliationFinder } from "@/components/affiliation-finder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAge } from "@/lib/dates";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <main className="container mx-auto p-4 py-8 md:p-8">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-headline font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
            ChronoGrid
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Enter the names and birth dates of your group members to visualize age differences and uncover shared generational ties.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2">
            <PersonInputForm people={people} onPeopleChange={handlePeopleChange} />
          </div>

          <div className="xl:col-span-3 space-y-8">
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
        </div>

        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>ChronoGrid &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}
