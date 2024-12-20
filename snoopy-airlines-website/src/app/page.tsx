"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import useSWR from "swr";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import Image from "next/image";
import SnoopyBackground from "../../public/snoopy-background.png";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import HighlightAircraftCard from "@/components/flights/HighlightAircraftCard";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) {
      throw new Error("Something went wrong with the request");
    }
    return r.json();
  });

export default function Home() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR("/api/flight/locations", fetcher);
  const [origin, setOrigin] = useState("Dallas");
  const [booking, setBooking] = useState("");
  const [destination, setDestination] = useState("Chicago");
  const [passengers, setPassengers] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });

  function onSearch() {
    let query = `/flights?origin=${origin}&destination=${destination}&departure=${format(
      dateRange?.from ?? "",
      "yyyy-MM-dd"
    )}&passengers=${passengers}`;

    if (dateRange?.to) {
      query += `&return=${format(dateRange?.to ?? "", "yyyy-MM-dd")}`;
    }

    router.push(query);
  }

 // Loading screen with a custom spinner and message
 if (isLoading)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center flex flex-row justify-center">
        <p className="mt-4 text-xl text-gray-500">Loading Snoopy Airlines information...</p>
      </div>
    </div>
  );

// Error screen with a friendly message and retry button
if (error)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
      <h2 className="text-3xl font-bold text-red-600">Oops! Something went wrong</h2>
      <p className="text-xl text-gray-600 mt-4">
        We could not load the page. Please try again later.
      </p>
      <Button
        className="mt-6"
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </div>
  );

  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen my-8">
      <div className="flex justify-center items-center">
        <Tabs defaultValue="book" className="w-[600px]">
          <TabsList className="grid w-full grid-cols-2 relative">
            <TabsTrigger className="z-10" value="book">
              Book
            </TabsTrigger>
            <TabsTrigger className="z-10" value="manage-trip">
              Manage Trip / Check-in
            </TabsTrigger>
          </TabsList>
          <TabsContent value="book">
            <Card className="h-[400px] flex flex-col justify-evenly">
              <CardHeader className="relative">
                <CardTitle className="z-10">Book</CardTitle>
                <CardDescription className="z-10">
                  Find Your Perfect Destination!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 space-x-2">
                  <div className="space-y-1">
                    <Label htmlFor="name">Origin</Label>
                    <Select
                      onValueChange={(value) => setOrigin(value)}
                      defaultValue={origin}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Dallas" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.origins.map(
                          (val: { Origin: string }, idx: number) => {
                            return (
                              <SelectItem key={idx} value={val.Origin}>
                                {val.Origin}
                              </SelectItem>
                            );
                          }
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Destination</Label>
                    <Select
                      onValueChange={(value) => setDestination(value)}
                      defaultValue={destination}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chicago" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.destinations.map(
                          (val: { Destination: string }, idx: number) => {
                            return (
                              <SelectItem key={idx} value={val.Destination}>
                                {val.Destination}
                              </SelectItem>
                            );
                          }
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 space-x-2">
                  <div className="space-y-1">
                    <Label htmlFor="name">Dates</Label>
                    <DatePickerWithRange
                      selectedDate={dateRange}
                      onDateChange={setDateRange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="name">Passengers</Label>
                    <div className="flex items-center">
                      <Button
                        onClick={() =>
                          setPassengers((prev) => Math.max(1, prev - 1))
                        }
                        disabled={passengers <= 1}
                      >
                        -
                      </Button>
                      <Input
                        value={passengers}
                        readOnly
                        type="text"
                        min={1}
                        max={5}
                        placeholder="1"
                        className="text-center w-full"
                      />
                      <Button
                        onClick={() =>
                          setPassengers((prev) => Math.min(5, prev + 1))
                        }
                        disabled={passengers >= 5}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={onSearch}>Search Flight</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="manage-trip">
            <Card>
              <CardHeader>
                <CardTitle>Manage Trip / Check-in</CardTitle>
                <CardDescription>
                  View or update your trip details and check in for your flight!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="current">Booking Reference Number</Label>
                  <Input
                    id="current"
                    type="text"
                    placeholder="BRXXXXXX"
                    value={booking}
                    onChange={(e) => setBooking(e.currentTarget.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    router.push(
                      `/reservation/manage-trip?bookingReference=${booking}`
                    )
                  }
                >
                  Search
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="w-[400px] h-[400px] relative ml-24 rounded-lg overflow-hidden shadow-lg">
          <Image
            alt="Mountains"
            src={SnoopyBackground}
            placeholder="blur"
            quality={100}
            fill
            sizes="100%"
            style={{
              objectFit: "cover",
            }}
            className="z-0 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 flex flex-col justify-end p-6 text-white">
            <h2 className="text-2xl font-semibold">Explore the World</h2>
            <p className="text-sm mt-2">Book your next adventure with us</p>
          </div>
        </div>
      </div>

      <HighlightAircraftCard />
    </div>
  );
}
