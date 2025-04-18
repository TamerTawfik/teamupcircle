"use server";

import { cache } from "react";
import fs from "fs/promises";
import path from "path";

export interface LookupItem {
  id: string;
  name: string;
}

const readLookupFile = async (filename: string): Promise<LookupItem[]> => {
  const filePath = path.join(process.cwd(), "src", "data", filename);
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data: LookupItem[] = JSON.parse(fileContent);
    if (!Array.isArray(data)) {
        console.error(`Invalid format in ${filename}: Expected an array.`);
        return [];
    }
    data.sort((a, b) => a.name.localeCompare(b.name));
    return data;
  } catch (error) {
    console.error(`Error reading or parsing ${filename}:`, error);
    return [];
  }
};

export const getTechOptions = cache(
  async (): Promise<LookupItem[]> => {
    return readLookupFile("techs.json");
  }
);

export const getProjectDomainOptions = cache(
  async (): Promise<LookupItem[]> => {
    return readLookupFile("projectDomains.json");
  }
);

export const getTeamRoleOptions = cache(
  async (): Promise<LookupItem[]> => {
    return readLookupFile("teamRoles.json");
  }
);
