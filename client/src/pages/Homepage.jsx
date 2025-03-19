/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { motion } from "framer-motion";
import { Heading, Text, Box, Button, Flex, Grid, Icon, Stack, Spinner } from "@chakra-ui/react";
import { FiArrowRight, FiDroplet, FiMapPin, FiRefreshCw, FiThermometer, FiWind } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useShowToast } from "../extensions/useShowToast";
import { useEffect, useState } from "react";

export default function HomePage() {
    const navigate = useNavigate();
    const MotionBox = motion(Box);
    const MotionButton = motion(Button);

    const showToast = useShowToast();

    const [requestReceived, setRequestReceived] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [locationData, setLocationData] = useState(null);

    const handleRefresh = () => {
        setWeatherData(null);
        setLocationData(null);
        setRequestReceived(false);
    };

    const fetchRealtimeWeatherData = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m`
            );

            const data = await response.json();
            
            setWeatherData({
                temp: data.current.temperature_2m,
                feels_like: data.current.apparent_temperature,
                humidity: data.current.relative_humidity_2m,
                wind_speed: data.current.wind_speed_10m
            });

            reverseGeocode(lat, lon);
        } catch (error) {
            console.error(error);
            showToast("error", "An error occurred while fetching weather data", "See console for more details");
        }
    };

    const reverseGeocode = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api-bdc.net/data/reverse-geocode?key=bdc_4293628798ca4d9b8515a1f3cb491219&latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );

            const data = await response.json();

            setLocationData([data.city, data.principalSubdivision, data.countryName].filter(Boolean).join(', '));
        } catch (error) {
            console.error(error);
            showToast("error", "An error occurred while fetching location data", "See console for more details");
        } finally {
            setRequestReceived(true);
        }
    }

    useEffect(() => {
        if (requestReceived) return;
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchRealtimeWeatherData(latitude, longitude);
                }, (error) => {
                    setRequestReceived(true);
                    console.error("Error obtaining location:", error);
                    showToast("error", "An error occurred while fetching location data", "See console for more details");
                }
            );
        } else {
            showToast("error", "Geolocation is not supported by your browser");
            setRequestReceived(true);
        }
    }, [requestReceived]);

    if (!requestReceived) return (
        <Box display={"flex"} flexDir={"column"} justifyContent={"center"} alignItems={"center"} minH={"100vh"}>
            <Spinner color='#4f46e5' />
        </Box>
    );

    if (requestReceived) return (
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

                {weatherData !== null && locationData !== null && (
                    <>
                        <Grid
                            templateColumns={["1fr", "1fr", "repeat(2, 1fr)", "repeat(4, 1fr)"]}
                            gap={6}
                            w="100%"
                        >
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
                                        <Icon as={FiThermometer} boxSize={6} color="blue.600" />
                                    </Box>
                                    <Box display="flex" flexDirection="column">
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium" textAlign={"left"}>
                                            Temperature
                                        </Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign={"left"}>
                                            {`${weatherData.temp} °C`}
                                        </Text>
                                    </Box>
                                </Box>
                            </MotionBox>

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
                                        <Icon as={FiThermometer} boxSize={6} color="blue.600" />
                                    </Box>
                                    <Box display="flex" flexDirection="column">
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium" textAlign={"left"}>
                                            Feels-like
                                        </Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign={"left"}>
                                            {`${weatherData.feels_like} °C`}
                                        </Text>
                                    </Box>
                                </Box>
                            </MotionBox>

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
                                        <Icon as={FiDroplet} boxSize={6} color="blue.600" />
                                    </Box>
                                    <Box display="flex" flexDirection="column">
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium" textAlign={"left"}>
                                            Humidity
                                        </Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign={"left"}>
                                            {`${weatherData.humidity} %`}
                                        </Text>
                                    </Box>
                                </Box>
                            </MotionBox>

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
                                        <Icon as={FiWind} boxSize={6} color="blue.600" />
                                    </Box>
                                    <Box display="flex" flexDirection="column">
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium" textAlign={"left"}>
                                            Wind Speed
                                        </Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign={"left"}>
                                            {`${weatherData.wind_speed.toFixed(1)} km/h`}
                                        </Text>
                                    </Box>
                                </Box>
                            </MotionBox>
                        </Grid>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <Flex
                                align="center"
                                justify="center"
                                bg="whiteAlpha.600"
                                backdropFilter="blur(4px)"
                                px={6}
                                py={3}
                                mt={10}
                                borderRadius="full"
                                boxShadow="sm"
                                gap={2}
                                transition="all 0.2s ease"
                            >
                                <Icon 
                                    as={FiMapPin} 
                                    boxSize={5} 
                                    color="blue.500" 
                                    style={{ filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))" }}
                                />
                                <Text
                                    fontSize="lg"
                                    fontWeight="medium"
                                    bgGradient="linear(to-r, blue.600, purple.500)"
                                    bgClip="text"
                                    letterSpacing="wide"
                                >
                                    Current Location:{" "}
                                    <Text as="span" fontWeight="semibold" color="gray.700">
                                        {locationData}
                                    </Text>
                                </Text>
                            </Flex>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Flex
                                    justifyContent={"center"}
                                    align="center"
                                    gap={2}
                                    cursor="pointer"
                                    onClick={handleRefresh}
                                    color="gray.600"
                                    _hover={{ color: "blue.600" }}
                                    transition="color 0.2s ease"
                                    mt={4}
                                >
                                    <Icon as={FiRefreshCw} boxSize={4} />
                                    <Text fontSize="sm" fontWeight="medium">
                                        Refresh Data
                                    </Text>
                                </Flex>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </Flex>
        </MotionBox>
    );
}