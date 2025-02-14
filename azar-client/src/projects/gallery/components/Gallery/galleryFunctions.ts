interface Breakpoint {
    width: number;
    percentage: number;
}

const breakpoints: Breakpoint[] = [
    {width: 320, percentage: 85},
    {width: 375, percentage: 80},
    {width: 425, percentage: 75},
    {width: 768, percentage: 45},
    {width: 1024, percentage: 35},
    {width: 1440, percentage: 25},
    {width: 2560, percentage: 15},
];

export const getSearchWidthPercentageDynamic = (screenWidth: number): string => {
    if (screenWidth <= breakpoints[0].width) {
        return `${breakpoints[0].percentage}%`;
    }
    if (screenWidth >= breakpoints[breakpoints.length - 1].width) {
        return `${breakpoints[breakpoints.length - 1].percentage}%`;
    }

    for (let i = 0; i < breakpoints.length - 1; i++) {
        const bp1 = breakpoints[i];
        const bp2 = breakpoints[i + 1];
        if (screenWidth >= bp1.width && screenWidth <= bp2.width) {
            const ratio = (screenWidth - bp1.width) / (bp2.width - bp1.width);
            const interpolatedPercentage = bp1.percentage + ratio * (bp2.percentage - bp1.percentage);
            return `${Math.round(interpolatedPercentage)}%`;
        }
    }
    return '100%';
};
