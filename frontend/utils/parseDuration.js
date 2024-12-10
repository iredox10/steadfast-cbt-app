// export const parseDuration = (duration) => {  
//     const parts = duration.split('hr');  
//     let totalSeconds = 0;  

//     if (parts[0]) {  
//         totalSeconds += parseInt(parts[0]) * 3600; // Convert hours to seconds  
//     }  
//     if (parts[1]) {  
//         const minutes = parts[1].match(/\d+/);  
//         if (minutes) {  
//             totalSeconds += parseInt(minutes[0]) * 60; // Convert minutes to seconds  
//         }  
//     }  
//     return totalSeconds;  
// };


export const parseDuration = (duration) => {  
    const parts = duration.split('hr');  
    let totalSeconds = 0;  

    if (parts[0]) {  
        totalSeconds += parseInt(parts[0]) * 3600; // Convert hours to seconds  
    }  
    if (parts[1]) {  
        const minutes = parts[1].match(/\d+/);  
        if (minutes) {  
            totalSeconds += parseInt(minutes[0]) * 60; // Convert minutes to seconds  
        }  
    }  
    return totalSeconds;  
};