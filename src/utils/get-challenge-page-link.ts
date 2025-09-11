import { routeBase } from "@/global";

const getChallengePageLink = (idOrSlug?: string) => {
    if (!idOrSlug) return routeBase.challenges;
    return (
        routeBase.challenges + "/" + idOrSlug
        // + "/" +
        // challenge.replace(new RegExp(`^${aerodrome}-`), "")
    );
};

export default getChallengePageLink;
