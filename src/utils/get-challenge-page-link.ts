import { routeBase } from "@/global";

const getChallengePageLink = (aerodrome?: string, challenge?: string) => {
    if (!aerodrome) return routeBase.challenges;
    if (!challenge) return routeBase.challenges;
    return (
        routeBase.challenges +
        "/" +
        aerodrome +
        "/" +
        challenge.replace(new RegExp(`^${aerodrome}-`), "")
    );
};

export default getChallengePageLink;
