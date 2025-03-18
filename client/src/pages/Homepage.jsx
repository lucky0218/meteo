/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { motion } from "framer-motion";
import { Heading, Text, Box, Button } from "@chakra-ui/react";
import { FiCloud, FiArrowRight } from "react-icons/fi";
import { FaCloud, FaCloudRain, FaCloudSunRain, FaSun, FaWind, FaBolt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    const MotionBox = motion(Box);
    const MotionButton = motion(Button);

    const weatherIcons = [
      { Icon: FaCloudSunRain, color: "#2563EB" },    // partly rainy with sun
      { Icon: FaCloudRain, color: "#1D4ED8" },       // rain
      { Icon: FaCloud, color: "#6B7280" },           // cloudy
      { Icon: FiCloud, color: "#3B82F6" },           // blue cloud outline
      { Icon: FaSun, color: "#FBBF24" },             // sunny
      { Icon: FaWind, color: "#3B82F6" },            // windy
      { Icon: FaBolt, color: "#F59E0B" }             // thunder
    ];

    const randomWeatherIcon = React.useMemo(() => {
      const randomIndex = Math.floor(Math.random() * weatherIcons.length);
      return weatherIcons[randomIndex];
    }, []);

    const WeatherIcon = randomWeatherIcon.Icon;
    const iconColor = randomWeatherIcon.color;

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-evenly"
            height="100vh"
            overflow="hidden"
            bgGradient="linear(to-br, #f0f4ff 0%, #f8fafc 100%)"
        >
            <MotionBox
                textAlign="center"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Heading
                    bgGradient="linear(to-r, #6366f1, #ec4899)"
                    bgClip="text"
                    fontSize="5xl"
                    fontWeight="extrabold"
                    textAlign="center"
                >
                    Welcome to Meteo Data
                </Heading>
            </MotionBox>

            <MotionBox
                bg="whiteAlpha.900"
                p={8}
                borderRadius="2xl"
                boxShadow="2xl"
                textAlign="center"
                maxW="lg"
            >
                <MotionBox
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    display="inline-block"
                    mb={6}
                >
                    <WeatherIcon size="48px" color={iconColor} />
                </MotionBox>
                <Text color="gray.600" fontSize="lg" mb={6}>
                    Get real-time weather insights and meteorological data at your fingertips.
                </Text>
                <Box>
                    <MotionButton
                        w="100%"
                        size="lg"
                        colorScheme="blue"
                        bgGradient="linear(to-r, #6366f1, #ec4899)"
                        _hover={{ boxShadow: "lg" }}
                        onClick={() => navigate("/dashboard")}
                        rightIcon={<FiArrowRight />}
                        fontWeight="bold"
                        borderRadius="xl"
                        py={6}
                    >
                        Get Started
                    </MotionButton>
                </Box>
            </MotionBox>
        </MotionBox>
    );
}
