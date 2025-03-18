/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { motion } from "framer-motion";
import { Heading, Text, Box, Button, Flex, Grid, Icon, Stack, Skeleton } from "@chakra-ui/react";
import { FiArrowRight, FiDroplet, FiThermometer, FiWind } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useShowToast } from "../extensions/useShowToast";
import { useEffect, useState } from "react";

export default function HomePage() {
    const navigate = useNavigate();
    const MotionBox = motion(Box);
    const MotionButton = motion(Button);

    const showToast = useShowToast();

    const [weatherData, setWeatherData] = useState(null);

    const fetchRealtimeWeatherData = async (lat, lon) => {
        try {
            console.log("Detected location:", lat, lon);
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            setWeatherData({
                temp: data.current.temperature_2m,
                feels_like: data.current.apparent_temperature,
                humidity: data.current.relative_humidity_2m,
                wind_speed: data.current.wind_speed_10m
            });
        } catch (error) {
            console.error(error);
            showToast("error", "An error occurred while fetching weather data", "See console for more details");
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchRealtimeWeatherData(latitude, longitude);
                    const interval = setInterval(() => {
                        fetchRealtimeWeatherData(latitude, longitude);
                    }, 60000);
                    return () => clearInterval(interval);
                },
                (error) => {
                    console.error("Error obtaining location:", error);
                    showToast("error", "An error occurred while fetching location data", "See console for more details");
                }
            );
        } else {
            showToast("error", "Geolocation is not supported by your browser");
        }
    }, []);

    const WeatherStat = ({ icon, label, value }) => (
        <MotionBox
            bg="white"
            p={5}
            borderRadius="xl"
            boxShadow="lg"
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Box display="flex">
                <Box
                    bg="blue.50"
                    p={4}
                    borderRadius="full"
                    mr={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Icon as={icon} boxSize={6} color="blue.600" />
                </Box>
                <Box display="flex" flexDirection="column">
                    <Text fontSize="sm" color="gray.500" fontWeight="medium" textAlign={"left"}>
                        {label}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign={"left"}>
                        {value}
                    </Text>
                </Box>
            </Box>
        </MotionBox>
    );

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            minH="100vh"
            bgGradient="linear(to-br, #f0f4ff 0%, #f8fafc 50%, #e0e7ff 100%)"
            p={8}
            position="relative"
            overflow="hidden"
        >
            <Flex
                direction="column"
                maxW="6xl"
                mx="auto"
                align="center"
                justify="center"
                minH="90vh"
                position="relative"
            >
                <Stack spacing={6} textAlign="center" maxW="2xl" mb={10}>
                    <Heading
                        fontSize={["3xl", "4xl", "5xl"]}
                        fontWeight="extrabold"
                        bgGradient="linear(to-r, #4f46e5, #ec4899)"
                        bgClip="text"
                        lineHeight="1.2"
                    >
                        Unlock Advanced Weather Insights
                    </Heading>

                    <Text fontSize="lg" color="gray.600" mb={4}>
                        Dive deeper into hyper-local forecasts, historical trends, and real-time climate analytics
                    </Text>

                    <MotionButton
                        size="lg"
                        colorScheme="blue"
                        bgGradient="linear(to-r, #6366f1, #ec4899)"
                        _hover={{ bgGradient: "linear(to-r, #818cf8, #f472b6)" }}
                        _active={{ transform: "scale(0.98)" }}
                        onClick={() => navigate("/dashboard")}
                        rightIcon={<FiArrowRight />}
                        alignSelf="center"
                        px={12}
                        py={7}
                        borderRadius="xl"
                        fontSize="lg"
                        fontWeight="bold"
                        color="white"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Launch Weather Dashboard
                    </MotionButton>
                </Stack>

                <Heading
                    fontSize={"3xl"}
                    fontWeight="extrabold"
                    bgGradient="linear(to-r, #4f46e5, #ec4899)"
                    bgClip="text"
                    lineHeight="1.2"
                    mb={5}
                >
                    Real-time Weather Analytics
                </Heading>

                {/* <Heading
                    fontSize={"3xl"}
                    fontWeight="extrabold"
                    bgGradient="linear(to-r, #4f46e5, #ec4899)"
                    bgClip="text"
                    lineHeight="1.2"
                    mb={5}
                >
                    Your Current Location:
                </Heading> */}

                <Grid
                    templateColumns={["1fr", "1fr", "repeat(2, 1fr)", "repeat(4, 1fr)"]}
                    gap={6}
                    w="100%"
                    mb={16}
                >
                    {weatherData ? (
                        <>
                            <WeatherStat
                                icon={FiThermometer}
                                label="Temperature"
                                value={`${weatherData.temp} °C`}
                            />
                            <WeatherStat
                                icon={FiThermometer}
                                label="Feels Like"
                                value={`${weatherData.feels_like} °C`}
                            />
                            <WeatherStat
                                icon={FiDroplet}
                                label="Humidity"
                                value={`${weatherData.humidity} %`}
                            />
                            <WeatherStat
                                icon={FiWind}
                                label="Wind Speed"
                                value={`${weatherData.wind_speed.toFixed(1)} km/h`}
                            />
                        </>
                    ) : (
                        <>
                            <Skeleton height="96px" borderRadius="xl" fadeDuration={1} />
                            <Skeleton height="96px" borderRadius="xl" fadeDuration={1} />
                            <Skeleton height="96px" borderRadius="xl" fadeDuration={1} />
                            <Skeleton height="96px" borderRadius="xl" fadeDuration={1} />
                        </>
                    )}
                </Grid>
            </Flex>
        </MotionBox>
    );
}