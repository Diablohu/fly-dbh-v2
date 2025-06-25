const prettifyTitle = (string: string) => {
    return string
        .replace(
            /(^|[^a-z0-9-_ \:\!\@\#\$\%\^\&\*\(\)：！（）【]| )([a-z0-9-_（），]+)/gi,
            "$1 $2 "
        )
        .trim();
};

export default prettifyTitle;
