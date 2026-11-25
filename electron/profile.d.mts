export type Profile={name:string;owner:string;phone:string;address:string;depotNumber:string;footer:string;logo:string};
export const defaultProfile:Profile;
export function validateProfile(input:unknown):Profile;
