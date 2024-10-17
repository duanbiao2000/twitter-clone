/**
 * 格式化帖子创建时间
 * 
 * 此函数将帖子的创建时间与当前时间进行比较，并返回一个表示时间差的字符串
 * 如果时间差超过1天，则返回月日格式的日期；如果等于1天，则返回"1d"；如果只有小时差，则返回小时数加"h"；
 * 如果只有分钟差，则返回分钟数加"m"；如果时间差小于一分钟，则返回"刚刚"
 * 
 * @param {string} createdAt - 帖子的创建时间，格式为"yyyy-mm-ddTHH:MM:SS"
 * @returns {string} - 表示时间差的字符串
 */
export const formatPostDate = (createdAt) => {
    // 获取当前日期和时间
    const currentDate = new Date();
    // 将帖子的创建时间字符串转换为Date对象
    const createdAtDate = new Date(createdAt);

    // 计算两个日期之间的时间差，单位为秒
    const timeDifferenceInSeconds = Math.floor((currentDate - createdAtDate) / 1000);
    // 将时间差转换为分钟
    const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
    // 将时间差转换为小时
    const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
    // 将时间差转换为天
    const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

    // 如果时间差超过1天，返回月日格式的日期
    if (timeDifferenceInDays > 1) {
        return createdAtDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (timeDifferenceInDays === 1) {
        // 如果时间差等于1天，返回"1d"
        return "1d";
    } else if (timeDifferenceInHours >= 1) {
        // 如果时间差只有小时，返回小时数加"h"
        return `${timeDifferenceInHours}h`;
    } else if (timeDifferenceInMinutes >= 1) {
        // 如果时间差只有分钟，返回分钟数加"m"
        return `${timeDifferenceInMinutes}m`;
    } else {
        // 如果时间差小于一分钟，返回"刚刚"
        return "Just now";
    }
};

/**
 * Formats the registration date into a more readable format.
 * 
 * @param {string} createdAt - The date the user was created in ISO format.
 * @returns {string} Returns a string indicating the month and year the user joined.
 */
export const formatMemberSinceDate = (createdAt) => {
    // Create a new Date object using the user's creation date
    const date = new Date(createdAt);
    
    // List of month names for formatting the date
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    
    // Get the month name from the Date object
    const month = months[date.getMonth()];
    
    // Get the year from the Date object
    const year = date.getFullYear();
    
    // Return the formatted join date string
    return `Joined ${month} ${year}`;
};
