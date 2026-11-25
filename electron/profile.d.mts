export type Profile={name:string;owner:string;phone:string;address:string;depotNumber:string;footer:string};
export const defaultProfile:Profile;
export function validateProfile(input:unknown):Profile;
