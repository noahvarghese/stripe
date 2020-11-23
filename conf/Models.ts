import { User } from "../lib/models/User";

export const Models = (): any[] => [
    {
        type: typeof User,
        class: User,
    },
];
