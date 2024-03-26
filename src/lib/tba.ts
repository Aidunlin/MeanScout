import type { Match } from "$lib";

const API_URL = "https://www.thebluealliance.com/api/v3";

export async function tbaFetch(endpoint: string, authKey: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: [["X-TBA-Auth-Key", authKey]],
  });

  const data = await response.json();

  if (response.status == 200) {
    return { status: "success" as const, data };
  } else if (response.status == 401) {
    return { status: "unauthorized" as const, error: data.Error };
  } else if (response.status == 404) {
    return { status: "not found" as const };
  } else {
    return { status: "error" as const };
  }
}

export async function tbaAuthKeyIsValid(authKey: string) {
  const response = await tbaFetch("/status", authKey);
  return response.status == "success";
}

export async function tbaEventExists(eventKey: string, authKey: string) {
  const response = await tbaFetch(`/event/${eventKey}/simple`, authKey);
  return response.status == "success";
}

export async function tbaGetTeamEvents(team: string, authKey: string) {
  const response = await tbaFetch(`/team/frc${team}/events/simple`, authKey);

  if (response.status == "success" && Array.isArray(response.data)) {
    const lastYear = new Date().getFullYear() - 1;

    return {
      events: response.data
        .filter((event) => event.year >= lastYear)
        .map((event) => ({ name: `${event.year} ${event.name}`, key: event.key }))
        .reverse(),
    };
  } else {
    return { error: `could not get events for team ${team}` };
  }
}

export async function tbaGetEventMatches(eventKey: string, authKey: string) {
  const response = await tbaFetch(`/event/${eventKey}/matches/simple`, authKey);

  if (response.status == "success" && Array.isArray(response.data)) {
    return response.data
      .filter((match) => match.comp_level == "qm")
      .map((match): Match => {
        return {
          number: match.match_number,
          red1: match.alliances.red.team_keys[0].replace("frc", ""),
          red2: match.alliances.red.team_keys[1].replace("frc", ""),
          red3: match.alliances.red.team_keys[2].replace("frc", ""),
          blue1: match.alliances.blue.team_keys[0].replace("frc", ""),
          blue2: match.alliances.blue.team_keys[1].replace("frc", ""),
          blue3: match.alliances.blue.team_keys[2].replace("frc", ""),
        };
      });
  }
}

export async function tbaGetEventTeams(eventKey: string, authKey: string) {
  const response = await tbaFetch(`/event/${eventKey}/teams/keys`, authKey);

  if (response.status == "success" && Array.isArray(response.data)) {
    const newTeams = new Set<string>();
    response.data.forEach((team) => {
      newTeams.add(`${team}`.trim().replace("frc", ""));
    });
    return [...newTeams];
  }
}
