function processWeatherData(data) {
    const current = data.currentConditions;

    return {
        location:data.resolveAddress,
        temperature:current.temp,
        feelsLike:current.feelslike,
        humidity:current.humidity,
        windSpeed:current.windspeed,
        conditions:current.conditions,
        description:current.description,
        icon:current.icon,
        date:current.datetime,
        forecast:data.days.slice(0,5).map((day)=> ({
            date:day.datetime,
            maxTemp:day.tempmax,
            minTemp:day.tempmin,
            conditions:day.conditions,
            icon:day.icon,
        })),
    };
}

export{processWeatherData};