function getAircraftFamilyName(name: string, makerName: string) {
    return `${makerName} ${name?.replace(
        new RegExp(`^${makerName}(-|$)`),
        ""
    )}`;
}

export default getAircraftFamilyName;
