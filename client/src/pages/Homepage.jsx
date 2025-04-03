/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { motion } from "framer-motion";
import { Heading, Text, Box, Button, Flex, Icon, Stack, Spinner, useBreakpointValue } from "@chakra-ui/react";
import { FiArrowRight, FiDroplet, FiMapPin, FiRefreshCw, FiThermometer, FiWind, FiBarChart as FiBarometer, FiCloudRain } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useShowToast } from "../extensions/useShowToast";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function HomePage() {
    const navigate = useNavigate();
    const MotionBox = motion.create(Box);
    const MotionButton = motion.create(Button);

    const showToast = useShowToast();

    const { t } = useTranslation();

    const headingSize = useBreakpointValue({ base: '3xl', md: '4xl', lg: '5xl' });
    const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });
    const [requestReceived, setRequestReceived] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [locationData, setLocationData] = useState(null);
    const [realtimeReady, setRealtimeReady] = useState(false);

    const handleRefresh = () => {
        setWeatherData(null);
        setLocationData(null);
        setRequestReceived(false);
    };

    const fetchRealtimeWeatherData = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,wind_direction_10m`
            );

            if (response.ok) {
                const data = await response.json();

                setWeatherData({
                    temp: data.current.temperature_2m,
                    feels_like: data.current.apparent_temperature,
                    humidity: data.current.relative_humidity_2m,
                    wind_speed: data.current.wind_speed_10m,
                    precipitation: data.current.precipitation,
                    pressure: data.current.surface_pressure,
                    wind_direction: data.current.wind_direction_10m,
                });

                reverseGeocode(lat, lon);
            } else {
                setRequestReceived(true);
                showToast("error",
                    t("anErrorOccuredWhileFetchingWeatherData"),
                    t("seeConsoleForMoreDetails")
                );
            }
        } catch (error) {
            console.error(error);
            showToast("error", 
                t("anErrorOccuredWhileFetchingWeatherData"),
                t("seeConsoleForMoreDetails")
            );
        }
    };

    const reverseGeocode = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api-bdc.net/data/reverse-geocode?key=bdc_4293628798ca4d9b8515a1f3cb491219&latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );

            const data = await response.json();

            setLocationData([data.city, data.principalSubdivision, data.countryName].filter(Boolean).join(', '));
            setRealtimeReady(true);
        } catch (error) {
            console.error(error);
            showToast(
                "error",
                t("anErrorOccuredWhileFetchingLocationData"),
                t("seeConsoleForMoreDetails")
            );

        } finally {
            setRequestReceived(true);
        }
    }

    useEffect(() => {
        if (requestReceived === false) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetchRealtimeWeatherData(latitude, longitude);
                    }, 
                    (error) => {
                        setRequestReceived(true);
                        showToast(
                            "error",
                            t("anErrorOccuredWhileFetchingLocationData"),
                            error.message
                        );
                    },
                    { timeout: 1500 } // Add timeout of 1.5 second
                );
            } else {
                showToast(
                    "error",
                    t("geolocationIsNotSupportedByYourBrowser")
                );
                setRequestReceived(true);
            }
        }
    }, [requestReceived]);

    if (!requestReceived) return (
        <Flex minH="100vh" align="center" justify="center">
            <Spinner size="xl" color='#4f46e5' thickness='4px' />
        </Flex>
    );

    if (requestReceived) return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            minH="100vh"
            bgGradient="linear(to-br, #f0f4ff 0%, #f8fafc 50%, #e0e7ff 100%)"
            position="relative"
            overflow="hidden"
        >
            <Flex
                direction="column"
                maxW="1200px"
                mx="auto"
                align="center"
                justify="center"
                minH="90vh"
                position="relative"
                px={{ base: 2, md: 4 }}
                mt={{ base: 24, md: 16 }}
            >
                <Stack spacing={6} textAlign="center" maxW="5xl" mb={{ base: 6, md: 10 }}>
                    <Heading
                        fontSize={headingSize}
                        fontWeight="extrabold"
                        bgGradient="linear(to-r, #4f46e5, #ec4899)"
                        bgClip="text"
                        lineHeight="1.2"
                        px={{ base: 2, md: 0 }}
                        py={{ base: 4, md: 6 }}
                    >
                        {t("homepageTitle")}
                    </Heading>

                    <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600" mb={4}>
                        {t("homepageDescription")}
                    </Text>

                    <MotionButton
                        size={buttonSize}
                        colorScheme="blue"
                        bgGradient="linear(to-r, #6366f1, #ec4899)"
                        _hover={{ bgGradient: "linear(to-r, #818cf8, #f472b6)" }}
                        _active={{ transform: "scale(0.98)" }}
                        onClick={() => navigate("/dashboard")}
                        rightIcon={<FiArrowRight />}
                        alignSelf="center"
                        px={{ base: 8, md: 12 }}
                        py={{ base: 5, md: 7 }}
                        borderRadius="xl"
                        fontSize="lg"
                        fontWeight="bold"
                        color="white"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {t("launchWeatherDashboard")}
                    </MotionButton>
                </Stack>

                {(weatherData !== null && locationData !== null && realtimeReady) && (
                    <>
                        <motion.div
                            style={{
                                width: '100%',
                                overflow: 'hidden',
                                position: 'relative',
                                padding: '1rem 0'
                            }}
                        >
                            <motion.div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    width: 'max-content'
                                }}
                                animate={{
                                    x: ['0%', '-50%']
                                }}
                                transition={{
                                    duration: 40,
                                    ease: 'linear',
                                    repeat: Infinity
                                }}
                            >
                                {[
                                    { icon: FiThermometer, title: t("temperature"), value: `${weatherData.temp} °C` },
                                    { icon: FiThermometer, title: t("feelsLike"), value: `${weatherData.feels_like} °C` },
                                    { icon: FiDroplet, title: t("humidity"), value: `${weatherData.humidity} %` },
                                    { icon: FiWind, title: t("windSpeed"), value: `${weatherData.wind_speed} km/h` },
                                    { icon: FiCloudRain, title: t("precipitation"), value: `${weatherData.precipitation} mm` },
                                    { icon: FiBarometer, title: t("pressure"), value: `${weatherData.pressure} hPa` },
                                    { icon: FiWind, title: t("windDirection"), value: `${weatherData.wind_direction}°` }
                                ].concat([
                                    { icon: FiThermometer, title: t("temperature"), value: `${weatherData.temp} °C` },
                                    { icon: FiThermometer, title: t("feelsLike"), value: `${weatherData.feels_like} °C` },
                                    { icon: FiDroplet, title: t("humidity"), value: `${weatherData.humidity} %` },
                                    { icon: FiWind, title: t("windSpeed"), value: `${weatherData.wind_speed} km/h` },
                                    { icon: FiCloudRain, title: t("precipitation"), value: `${weatherData.precipitation} mm` },
                                    { icon: FiBarometer, title: t("pressure"), value: `${weatherData.pressure} hPa` },
                                    { icon: FiWind, title: t("windDirection"), value: `${weatherData.wind_direction}°` }
                                ]).map((card, index) => (
                                    <MotionBox
                                        key={index}
                                        bg="white"
                                        p={{ base: 3, md: 5 }}
                                        borderRadius="xl"
                                        transition={{ duration: 0.2 }}
                                        display="flex"
                                        flexDirection="column"
                                        minWidth={{ base: '160px', md: '220px' }}
                                        flex="none"
                                        style={{
                                            // Remove any potential gaps
                                            marginRight: 0,
                                            border: 'none',
                                            outline: 'none'
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" flexDirection={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 0 }}>
                                            <Box
                                                bg="blue.50"
                                                p={{ base: 3, md: 4 }}
                                                borderRadius="full"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                w={{ base: 10, md: 12 }}
                                                h={{ base: 10, md: 12 }}
                                                mr={{ base: 0, md: 4 }}
                                                mb={{ base: 1, md: 0 }}
                                            >
                                                <Icon
                                                    as={card.icon}
                                                    boxSize={{ base: 5, md: 6 }}
                                                    color="blue.600"
                                                />
                                            </Box>
                                            <Box>
                                                <Text
                                                    fontSize={{ base: '2xs', md: 'sm' }}
                                                    color="gray.500"
                                                    fontWeight="medium"
                                                    mb={{ base: 0.5, md: 0 }}
                                                    textAlign={{ base: 'center', md: 'left' }}
                                                >
                                                    {card.title}
                                                </Text>
                                                <Text
                                                    fontSize={{ base: 'lg', md: '2xl' }}
                                                    fontWeight="bold"
                                                    color="gray.800"
                                                    textAlign={{ base: 'center', md: 'left' }}
                                                >
                                                    {card.value}
                                                </Text>
                                            </Box>
                                        </Box>
                                    </MotionBox>
                                ))}
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            style={{ width: '100%' }}
                        >
                            <Flex
                                direction={{ base: 'column', md: 'row' }}
                                align="center"
                                justify="center"
                                bg="whiteAlpha.600"
                                backdropFilter="blur(4px)"
                                px={{ base: 4, md: 6 }}
                                py={{ base: 2, md: 3 }}
                                mt={{ base: 4, md: 10 }}
                                borderRadius="full"
                                boxShadow="sm"
                                gap={2}
                                w={{ base: '90%', md: '80%' }}
                                mx="auto"
                                transition="all 0.2s ease"
                            >
                                <Icon
                                    as={FiMapPin}
                                    boxSize={{ base: 4, md: 5 }}
                                    color="blue.500"
                                    style={{ filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))" }}
                                />
                                <Text
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    fontWeight="medium"
                                    bgGradient="linear(to-r, blue.600, purple.500)"
                                    bgClip="text"
                                    textAlign="center"
                                >
                                    {t("currentLocation")}
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
                                    justifyContent="center"
                                    align="center"
                                    gap={2}
                                    cursor="pointer"
                                    onClick={handleRefresh}
                                    color="gray.600"
                                    _hover={{ color: "blue.600" }}
                                    transition="color 0.2s ease"
                                    mt={{ base: 3, md: 4 }}
                                    mb={{ base: 6, md: 10 }}
                                >
                                    <Icon as={FiRefreshCw} boxSize={{ base: 3, md: 4 }} />
                                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium">
                                        {t("refreshData")}
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