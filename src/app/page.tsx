
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import type { Person } from "@/lib/types";
import { PersonInputForm } from "@/components/person-input-form";
import { AgeDistanceGrid } from "@/components/age-distance-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAge } from "@/lib/dates";
import { getGeneration, generationCohorts, type Generation, generationSources, type GenerationSource } from "@/lib/generations";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Users, Info, Bot, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function HomePageContent() {
  const { toast } = useToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [groupByGeneration, setGroupByGeneration] = useState(false);
  const [generationSortDirection, setGenerationSortDirection] = useState<'ascending' | 'descending'>('ascending');
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dataParam = searchParams.get('data');
      if (dataParam) {
        try {
          const decodedData = atob(decodeURIComponent(dataParam));
          const peopleFromUrl: Person[] = decodedData.split(';').map((line, index) => {
            const parts = line.split(',');
            const name = parts[0] ? parts[0].trim() : '';
            const dob = parts[1] ? parts[1].trim() : '';
            return { id: Date.now() + index, name, dob };
          }).filter(p => p.name && p.dob);
          handlePeopleChange(peopleFromUrl);
        } catch (error) {
          console.error("Failed to parse data from URL:", error);
        }
      } else {
        // Load default data if no URL param
        const defaultData = [
          { id: 1, name: 'Olivia Chen', dob: '1985-03-12' },
          { id: 2, name: 'Benjamin Carter', dob: '1992-07-24' },
          { id: 3, name: 'Sophia Rodriguez', dob: '1978-11-02' },
          { id: 4, name: 'William Kim', dob: '2001-01-15' },
          { id: 5, name: 'Ava Williams', dob: '1998-09-30' },
        ];
        handlePeopleChange(defaultData);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    
    // Default sort: age ascending, then name ascending
    const sortedPeople = [...filtered].sort((a, b) => {
      const ageDiff = (a.age ?? 0) - (b.age ?? 0);
      if (ageDiff !== 0) return ageDiff;
      return a.name.localeCompare(b.name);
    });

    if (groupByGeneration) {
      return [...sortedPeople].sort((a, b) => {
        if (!a.generation || !b.generation) return 0;

        const aCohort = generationCohorts.find(c => c.nickname === a.generation!.nickname);
        const bCohort = generationCohorts.find(c => c.nickname === b.generation!.nickname);
        
        if (aCohort && bCohort) {
          const generationSort = generationSortDirection === 'ascending' 
            ? aCohort.startYear - bCohort.startYear 
            : bCohort.startYear - aCohort.startYear;
          if (generationSort !== 0) {
            return generationSort;
          }
        }
        
        const ageDiff = (a.age ?? 0) - (b.age ?? 0);
        if (ageDiff !== 0) return ageDiff;
        return a.name.localeCompare(b.name);
      });
    }

    return sortedPeople;
  }, [people, groupByGeneration, generationSortDirection]);
  
  const toggleGenerationSortDirection = () => {
    setGenerationSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
  };

  if (!isClient) {
    return null;
  }

  const GenerationData = () => {
    const [cohortSortDirection, setCohortSortDirection] = useState<'ascending' | 'descending'>('descending');
    const [sourceSortDirection, setSourceSortDirection] = useState<'ascending' | 'descending'>('ascending');

    const sortedCohorts = useMemo(() => {
        let sortableItems = [...generationCohorts];
        sortableItems.sort((a, b) => {
            const comparison = a.startYear < b.startYear ? -1 : 1;
            return cohortSortDirection === 'ascending' ? comparison : -comparison;
        });
        return sortableItems;
    }, [cohortSortDirection]);

    const sortedSources = useMemo(() => {
        let sortableItems = [...generationSources];
        sortableItems.sort((a, b) => {
            const comparison = a.sourceType.localeCompare(b.sourceType);
            return sourceSortDirection === 'ascending' ? comparison : -comparison;
        });
        return sortableItems;
    }, [sourceSortDirection]);

    const toggleCohortSort = () => {
        setCohortSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
    };

    const toggleSourceSort = () => {
        setSourceSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
    };

    const SortableHeader = ({ children, className, onClick, sortDirection }: { children: React.ReactNode; className?: string; onClick: () => void; sortDirection: 'ascending' | 'descending' }) => (
        <TableHead className={cn("cursor-pointer hover:bg-muted/50 group", className)} onClick={onClick}>
            <div className="flex items-center">
                {children}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        </TableHead>
    );

    return (
        <Card className="shadow-lg animate-fade-in mt-8">
            <CardHeader>
                <CardTitle>Generation Data</CardTitle>
                <CardDescription>The data used to determine generational labels and their sources.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>View Generation Cohorts</AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-x-auto rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <SortableHeader onClick={toggleCohortSort} sortDirection={cohortSortDirection}>Nickname</SortableHeader>
                                            <SortableHeader onClick={toggleCohortSort} sortDirection={cohortSortDirection}>Formal Name</SortableHeader>
                                            <SortableHeader onClick={toggleCohortSort} sortDirection={cohortSortDirection}>Birth Year Range</SortableHeader>
                                            <SortableHeader onClick={toggleCohortSort} sortDirection={cohortSortDirection}>Defining Trait</SortableHeader>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedCohorts.map((cohort) => (
                                            <TableRow key={cohort.name}>
                                                <TableCell className="font-medium">{cohort.nickname}</TableCell>
                                                <TableCell>{cohort.name}</TableCell>
                                                <TableCell>{cohort.startYear} – {cohort.endYear}</TableCell>
                                                <TableCell className="text-muted-foreground">{cohort.definingTrait}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>View Data Sources</AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-x-auto rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <SortableHeader onClick={toggleSourceSort} sortDirection={sourceSortDirection}>Source Type</SortableHeader>
                                            <SortableHeader onClick={toggleSourceSort} sortDirection={sourceSortDirection}>Specific Example(s)</SortableHeader>
                                            <SortableHeader onClick={toggleSourceSort} sortDirection={sourceSortDirection}>Role in Defining Generations</SortableHeader>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedSources.map((source) => (
                                            <TableRow key={source.sourceType}>
                                                <TableCell className="font-medium">{source.sourceType}</TableCell>
                                                <TableCell>{source.examples}</TableCell>
                                                <TableCell className="text-muted-foreground">{source.role}</TableCell>
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

  const TopBar = () => (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-6">
      <div className="flex items-center gap-2">
        <Bot className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold tracking-tighter">ChronoGrid</h1>
      </div>
      <div className="ml-auto">
        <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(!isSheetOpen)}>
          {isSheetOpen ? <PanelRightClose /> : <PanelRightOpen />}
          <span className="sr-only">Toggle Panel</span>
        </Button>
      </div>
    </header>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col">
          <TopBar />
          <main className={cn(
            "flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 transition-all duration-300 ease-in-out",
            isSheetOpen ? "mr-[350px]" : "mr-0"
          )}>
            <div className="grid auto-rows-max items-start gap-4 md:gap-8">
                <Card className="shadow-lg animate-fade-in">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Age Distance</CardTitle>
                        <CardDescription>Visualizing the age differences in years between group members.</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 pt-1">
                        <Checkbox id="group-by-generation" checked={groupByGeneration} onCheckedChange={(checked) => setGroupByGeneration(!!checked)} />
                        <Label htmlFor="group-by-generation" className="cursor-pointer">Group by Generation</Label>
                        <Button variant="ghost" size="icon" onClick={toggleGenerationSortDirection} className={`h-6 w-6 ${!groupByGeneration ? 'hidden' : ''}`}>
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
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
          </main>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="w-[350px] sm:w-[350px] p-0" hideCloseButton={true}>
              <div className="h-full overflow-y-auto">
                <PersonInputForm people={people} onPeopleChange={handlePeopleChange} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
  );
}

export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </React.Suspense>
  );
}
