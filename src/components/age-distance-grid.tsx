"use client";

import type { Person } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AgeDistanceGridProps {
  people: Person[];
}

export function AgeDistanceGrid({ people }: AgeDistanceGridProps) {

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="sticky left-0 bg-muted/50 z-10 w-1/4 min-w-[150px]"></TableHead>
            {people.map((person, index) => (
              <TableHead key={person.id} className="text-center font-bold p-2 whitespace-nowrap animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                {person.name} ({person.age})
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((rowPerson, rowIndex) => (
            <TableRow key={rowPerson.id} className="animate-fade-in" style={{animationDelay: `${rowIndex * 0.1}s`}}>
              <TableHead className="sticky left-0 bg-card z-10 font-bold p-2 whitespace-nowrap">
                {rowPerson.name} ({rowPerson.age})
              </TableHead>
              {people.map((colPerson) => (
                <TableCell key={colPerson.id} className="text-center p-2">
                  {rowPerson.id === colPerson.id ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className="font-mono text-lg font-semibold text-primary-foreground/80">
                      {Math.abs((rowPerson.age || 0) - (colPerson.age || 0))}
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
