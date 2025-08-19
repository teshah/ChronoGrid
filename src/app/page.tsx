"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import type { Person } from "@/lib/types";
import { PersonInputForm } from "@/components/person-input-form";
import { AgeDistanceGrid } from "@/components/age-distance-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAge } from "@/lib/dates";
import { getGeneration, generationCohorts, type Generation, generationSources, type GenerationSource } from "@/lib/generations";
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, ArrowUpDown, Users, Info, Settings, Bot, Link } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function HomePageContent() {
  const { toast } = useToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [isClient, setIsClient] = useState(false);
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

  const handleShareLink = () => {
    const validPeople = people.filter(p => p.name && p.dob);
    if (validPeople.length === 0) {
      toast({
        title: 'No Data to Share',
        description: 'Please add at least one person with a name and date of birth.',
        variant: 'destructive'
      });
      return;
    }
    const dataString = validPeople.map(p => `${p.name},${p.dob}`).join(';');
    const encodedData = btoa(dataString);
    const url = `${window.location.origin}/?data=${encodeURIComponent(encodedData)}`;
    
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'Link Copied!',
        description: 'A shareable link has been copied to your clipboard.',
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast({
        title: 'Error',
        description: 'Could not copy the link to your clipboard.',
        variant: 'destructive'
      });
    });
  };

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
          const generationSort = generationSortDirection === 'ascending' 
            ? aCohort.startYear - bCohort.startYear 
            : bCohort.startYear - aCohort.startYear;
          if (generationSort !== 0) {
            return generationSort;
          }

          const ageSort = (a.age ?? 0) - (b.age ?? 0);
          if (ageSort !== 0) {
            return ageSort;
          }

          return a.name.localeCompare(b.name);
        }
        return 0;
      });
    }
    return filtered;
  }, [people, groupByGeneration, generationSortDirection]);
  
  const toggleGenerationSortDirection = () => {
    setGenerationSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
  };

  if (!isClient) {
    return null;
  }

  const GenerationData = () => {
    const [cohortSortConfig, setCohortSortConfig] = useState<{ key: keyof Generation; direction: 'ascending' | 'descending' } | null>({ key: 'startYear', direction: 'descending' });
    const [sourceSortConfig, setSourceSortConfig] = useState<{ key: keyof GenerationSource; direction: 'ascending' | 'descending' } | null>({ key: 'sourceType', direction: 'ascending' });

    const sortedCohorts = useMemo(() => {
      let sortableItems = [...generationCohorts];
      if (cohortSortConfig !== null) {
        sortableItems.sort((a, b) => {
          const aValue = a[cohortSortConfig.key];
          const bValue = b[cohortSortConfig.key];
          if (aValue < bValue) {
            return cohortSortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return cohortSortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      return sortableItems;
    }, [cohortSortConfig]);
    
    const sortedSources = useMemo(() => {
      let sortableItems = [...generationSources];
      if (sourceSortConfig !== null) {
        sortableItems.sort((a, b) => {
          const aValue = a[sourceSortConfig.key];
          const bValue = b[sourceSortConfig.key];
          if (aValue < bValue) {
            return sourceSortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sourceSortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      return sortableItems;
    }, [sourceSortConfig]);

    const requestCohortSort = (key: keyof Generation) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (cohortSortConfig && cohortSortConfig.key === key && cohortSortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setCohortSortConfig({ key, direction });
    };
    
    const requestSourceSort = (key: keyof GenerationSource) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sourceSortConfig && sourceSortConfig.key === key && sourceSortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSourceSortConfig({ key, direction });
    };

    const getCohortSortIndicator = (key: keyof Generation) => {
      if (!cohortSortConfig || cohortSortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
      }
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    };

    const getSourceSortIndicator = (key: keyof GenerationSource) => {
      if (!sourceSortConfig || sourceSortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
      }
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    };

    const SortableCohortHeader = ({ columnKey, children, className }: { columnKey: keyof Generation; children: React.ReactNode; className?: string }) => (
      <TableHead className={cn("cursor-pointer hover:bg-muted/50 group", className)} onClick={() => requestCohortSort(columnKey)}>
        <div className="flex items-center">
          {children}
          {getCohortSortIndicator(columnKey)}
        </div>
      </TableHead>
    );

    const SortableSourceHeader = ({ columnKey, children, className }: { columnKey: keyof GenerationSource; children: React.ReactNode; className?: string }) => (
      <TableHead className={cn("cursor-pointer hover:bg-muted/50 group", className)} onClick={() => requestSourceSort(columnKey)}>
        <div className="flex items-center">
          {children}
          {getSourceSortIndicator(columnKey)}
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
                          <SortableCohortHeader columnKey="nickname">Nickname</SortableCohortHeader>
                          <SortableCohortHeader columnKey="name">Formal Name</SortableCohortHeader>
                          <SortableCohortHeader columnKey="startYear">Birth Year Range</SortableCohortHeader>
                          <SortableCohortHeader columnKey="definingTrait">Defining Trait</SortableCohortHeader>
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
                          <SortableSourceHeader columnKey="sourceType">Source Type</SortableSourceHeader>
                          <SortableSourceHeader columnKey="examples">Specific Example(s)</SortableSourceHeader>
                          <SortableSourceHeader columnKey="role">Role in Defining Generations</SortableSourceHeader>
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
      <div className="relative ml-auto flex-1 md:grow-0">
        <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
       <Avatar>
          <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person face" />
          <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </header>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar collapsible="icon" className="hidden sm:flex" onMouseDown={(e) => e.preventDefault()}>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" isActive={true} tooltip="Groups">
                  <Users />
                  <span>Groups</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="About">
                  <Info />
                  <span>About</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col sm:ml-14">
          <TopBar />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                <Card className="shadow-lg animate-fade-in">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Age Distance Grid</CardTitle>
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
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
              <div className="w-full">
                <Button onClick={handleShareLink} variant="outline" className="w-full mb-4">
                  <Link className="mr-2 h-4 w-4" /> Share Link
                </Button>
                <PersonInputForm people={people} onPeopleChange={handlePeopleChange} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </React.Suspense>
  );
}
