/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { Box, Heading, Text, Icon, Grid, useBreakpointValue, Button } from '@chakra-ui/react';
import { FiClock, FiAlertTriangle, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
    const navigate = useNavigate();

    const MotionBox = motion(Box);
    const MotionButton = motion(Button);

    const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

    const features = [
        { icon: FiUser, title: "Ease of use", description: "Intuitive web-based solution for accurate weather information" },
        { icon: FiClock, title: "Historical Data", description: "Access accurate weather archives and view detailed data comparisons" },
        { icon: FiAlertTriangle, title: "Risk Analysis", description: "Advanced impact assessment for businesses" },
    ];

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            bgGradient="linear(to-br, #f0f4ff 0%, #f8fafc 100%)"
            minH="100vh"
            py={16}
            px={4}
        >
            <MotionBox
                textAlign="center"
                mb={16}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Heading
                    bgGradient="linear(to-r, #6366f1, #ec4899)"
                    bgClip="text"
                    fontSize={{ base: '4xl', md: '6xl' }}
                    mb={6}
                    mt={10}
                >
                    About Meteo Data
                </Heading>
                <Text fontSize="xl" color="gray.600" maxW="800px" mx="auto">
                    Empowering your decisions with hyper-accurate weather intelligence and beautiful data visualization
                </Text>
            </MotionBox>

            <Grid
                templateColumns={`repeat(${gridColumns}, 1fr)`}
                gap={8}
                maxW="1200px"
                mx="auto"
                mb={20}
            >
                {features.map((feature, index) => (
                    <MotionBox
                        key={index}
                        p={8}
                        borderRadius="2xl"
                        bg="whiteAlpha.900"
                        boxShadow="xl"
                        whileHover={{ y: -10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Icon as={feature.icon} boxSize={12} color="#4F46E5" mb={4} />
                        <Heading fontSize="2xl" mb={4}>{feature.title}</Heading>
                        <Text color="gray.600">{feature.description}</Text>
                    </MotionBox>
                ))}
            </Grid>

            <MotionBox
                textAlign="center"
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
            >
                <Heading fontSize="3xl" mb={6}>Ready for Better Weather Insights?</Heading>
                <MotionButton
                    size="lg"
                    colorScheme="blue"
                    bgGradient="linear(to-r, #6366f1, #ec4899)"
                    _hover={{ boxShadow: "lg" }}
                    onClick={() => navigate("/dashboard")}
                    fontWeight="bold"
                    borderRadius="xl"
                    py={6}
                >
                    Start Exploring Now
                </MotionButton>
            </MotionBox>
        </MotionBox>
    );
};

export default AboutUs;