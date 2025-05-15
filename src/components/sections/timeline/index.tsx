"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Briefcase, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Events } from "@/types/events";
import { events } from "@/data/events";
import SectionContainer from "@/components/sections/section-container";

export function Timeline() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(null);
      const timer = setTimeout(() => {
        setExpandedIndex(index);
        clearTimeout(timer);
      }, 300); // Match this with your exit animation duration
    }
  };

  // Helper function to format period
  const formatPeriod = (item: Events[0]) => {
    if (item.periodType === "Q") {
      return `Q${item.periodNumber} ${item.year}`;
    } else if (item.periodType === "H") {
      return `H${item.periodNumber} ${item.year}`;
    }
    return `${item.year}`;
  };

  return (
    <SectionContainer id="timeline" className="text-center">
      <div className="mx-auto px-4 py-12 max-w-5xl">
        <motion.h3
          className="text-2xl md:text-4xl  mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Teamup Circle Timeline
        </motion.h3>

        <motion.p
          className="text-muted-foreground text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Our development journey and milestones
        </motion.p>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-primary/20 z-0"></div>

          {events.map((item, index) => (
            <motion.div
              key={index}
              className={`mb-12 relative z-10 flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-primary z-10"></div>

              {/* Date badge - visible on mobile and on appropriate side for desktop */}
              <div
                className={`md:w-1/2 flex ${
                  index % 2 === 0
                    ? "md:justify-end md:pr-8"
                    : "md:justify-start md:pl-8"
                }`}
              >
                <motion.div
                  className="mb-4 md:mb-0"
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge
                    variant="outline"
                    className="text-sm py-1 px-3 bg-primary/5 border-primary/20"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatPeriod(item)}
                  </Badge>
                </motion.div>
              </div>

              {/* Card - takes full width on mobile, half width on desktop */}
              <div
                className={`md:w-1/2 ${index % 2 === 0 ? "md:pl-8" : "md:pr-8"}`}
              >
                <motion.div
                  layout
                  className="w-full"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div
                        className="p-6 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleExpand(index)}
                      >
                        <div>
                          <h3 className="text-lg  text-foreground">
                            {item.year} Milestones
                          </h3>
                          <p className="text-md font-medium">
                            {item.periodType === "Q"
                              ? `Quarter ${item.periodNumber}`
                              : `Half ${item.periodNumber}`}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <CheckCircle
                              className={`w-4 h-4 mr-1 ${
                                item.isChecked
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            />
                            {item.isChecked ? "Completed" : "In Progress"}
                          </div>
                        </div>
                        <motion.div
                          animate={{
                            rotate: expandedIndex === index ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {expandedIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-2 border-t border-border/50">
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold flex items-center mb-2">
                                  <Briefcase className="w-4 h-4 mr-2 text-primary" />
                                  Events
                                </h4>
                                <ul className="grid grid-cols-1 gap-2">
                                  {item.events.map((event, i) => (
                                    <motion.li
                                      key={i}
                                      className="flex items-start"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: i * 0.1,
                                      }}
                                    >
                                      <CheckCircle
                                        className={`w-4 h-4 mr-2 ${
                                          event.isChecked
                                            ? "text-green-500"
                                            : "text-gray-400"
                                        } mt-0.5 shrink-0`}
                                      />
                                      <span className="text-sm">
                                        {event.title}
                                      </span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
