/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { Heading, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Menu, MenuButton, MenuList, MenuItem, Flex, Input, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Text, IconButton, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Stack, Tag, TagLabel, TagLeftIcon, useColorModeValue } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiMapPin, FiCalendar } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useState } from 'react';
import { useShowToast } from '../extensions/useShowToast';
import server from "../../networking";

const Dashboard = () => {
    const MotionBox = motion.div;

    const showToast = useShowToast();

    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedDate, setSelectedDate] = useState("2025-03-09");
    const [loading, setLoading] = useState(false);
    const [advancedLoading, setAdvancedLoading] = useState(false);
    const [advancedRenderReady, setAdvancedRenderReady] = useState(false);
    const [data, setData] = useState([]);
    const [sortOrderAvg, setSortOrderAvg] = useState('desc');
    const [sortOrderFD, setSortOrderFD] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("station");
    const [advancedAnalysisList, setAdvancedAnalysisList] = useState([]);
    const [advancedData, setAdvancedData] = useState([]);
    const [selectedAnalysisDate, setSelectedAnalysisDate] = useState('');
    const [chartModalOpen, setChartModalOpen] = useState(false);

    const recordsPerPage = 7;
    const { isOpen, onOpen, onClose } = useDisclosure();

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    const TemperatureComparisonChart = ({ data, date }) => {
        const chartData = {
            labels: data.map(entry => entry.name),
            datasets: [{
                label: `Average Temperature (°C) - ${date}`,
                data: data.map(entry => entry.Avg),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                hoverBorderWidth: 3
            }]
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Temperature Comparison - ${date}`,
                    color: useColorModeValue('#1A202C', '#FFFFFF'),
                    font: { size: 18 }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: useColorModeValue('#1A202C', '#FFFFFF'),
                        font: { weight: 'bold' }
                    }
                },
                y: {
                    grid: { color: useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)') },
                    ticks: {
                        color: useColorModeValue('#1A202C', '#FFFFFF'),
                        stepSize: 5
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        };

        return (
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                bg={useColorModeValue('white', 'gray.700')}
                p={6}
                borderRadius="xl"
                boxShadow="xl"
            >
                <Bar data={chartData} options={options} />
            </MotionBox>
        );
    };

    const handleSubmitStation = async () => {
        if (!selectedStation) return;
        setLoading(true);
        try {
            const response = await server.get(`/by_station?station=${selectedStation}`);
            setData(response.data);
            if (response.data.length === 0) {
                showToast("error", "No data found", "Please try another station");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDate = async () => {
        if (!selectedDate) return;
        setLoading(true);
        try {
            const response = await server.get(`/by_date?date=${selectedDate}`);
            setData(response.data.data);
            setAdvancedRenderReady(true);
        } catch (error) {
            setData([]);
            if (error.response.data.success === false) {
                showToast("error", error.response.data.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const openAdvancedAnalysisModal = async () => {
        if (advancedAnalysisList.length < 2) {
            showToast("error", "Please select at least 2 stations");
            return;
        } else if (advancedAnalysisList.length > 3) {
            showToast("error", "You can select a max of 3 stations");
            return;
        } else {
            onOpen();
        }
    };

    const handleAdvancedAnalysis = async () => {
        setAdvancedLoading(true);
        try {
            const response = await server.post('/advancedAnalysis', {
                stations: advancedAnalysisList,
                date: selectedDate
            });

            setAdvancedData(response.data.data);
            setSelectedAnalysisDate(selectedDate);
            setChartModalOpen(true);
        } catch (error) {
            if (error.response.data.success === false) {
                showToast("error", error.response.data.error);
            }
        } finally {
            setAdvancedLoading(false);
            onClose();
        }
    };

    const sortDataAvg = () => {
        const sorted = [...data].sort((a, b) =>
            sortOrderAvg === 'asc' ? a.Avg - b.Avg : b.Avg - a.Avg
        );
        setData(sorted);
        setSortOrderAvg(sortOrderAvg === 'asc' ? 'desc' : 'asc');
    };

    const sortDataFD = () => {
        const sorted = [...data].sort((a, b) =>
            sortOrderFD === 'asc' ? a.FDAvg - b.FDAvg : b.FDAvg - a.FDAvg
        );
        setData(sorted);
        setSortOrderFD(sortOrderFD === 'asc' ? 'desc' : 'asc');
    };

    const handleCheckboxChange = (e, stationCode) => {
        if (e.target.checked) {
            setAdvancedAnalysisList((prev) => {
                if (!prev.includes(stationCode) && prev.length < 3) {
                    return [...prev, stationCode];
                }
                return prev;
            });
        } else {
            setAdvancedAnalysisList((prev) => prev.filter(code => code !== stationCode));
        }
    };

    const stationList = [
        { code: 58349, name: "苏州" },
        { code: 58238, name: "南京" },
        { code: 58354, name: "无锡" },
        { code: 58343, name: "常州" },
        { code: 58252, name: "镇江" },
        { code: 58259, name: "南通" },
        { code: 58246, name: "泰州" },
        { code: 58245, name: "扬州" },
        { code: 58027, name: "徐州" },
        { code: 58044, name: "连云港" },
        { code: 58141, name: "淮安" },
        { code: 58154, name: "盐城" },
        { code: 58131, name: "宿迁" },
    ];

    const paginateData = (data) => {
        if (!Array.isArray(data)) return [];
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(data.length / recordsPerPage);
    const displayedData = paginateData(data);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <>
            <MotionBox
                display="flex"
                flexDirection="column"
                minH="100vh"
                bgGradient="linear(to-br, #f0f4ff 0%, #f8fafc 100%)"
                py={16}
                px={4}
            >
                <Box flex="1">
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
                            fontSize={{ base: '3xl', md: '4xl' }}
                            mb={3}
                            mt={24}
                        >
                            Weather Dashboard
                        </Heading>
                    </MotionBox>

                    <MotionBox
                        display="flex"
                        justifyContent="center"
                        mx="auto"
                        mb={20}
                    >
                        <Tabs variant='soft-rounded' colorScheme='green'>
                            <TabList display="flex" justifyContent="center" mt={10} mb={5}>
                                <Tab
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setActiveTab("station");
                                        setData([]);
                                        setAdvancedRenderReady(false);
                                    }}
                                    _selected={{
                                        bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                        color: "white",
                                        boxShadow: "md",
                                    }}
                                    _hover={{ transform: "scale(1.05)" }}
                                    _active={{ transform: "scale(0.95)" }}
                                    mx={2}
                                    px={6}
                                    py={2}
                                    borderRadius="full"
                                    transition="all 0.2s"
                                >
                                    Search By Station
                                </Tab>
                                <Tab
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setActiveTab("date");
                                        setData([]);
                                    }}
                                    _selected={{
                                        bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                        color: "white",
                                        boxShadow: "md",
                                    }}
                                    _hover={{ transform: "scale(1.05)" }}
                                    _active={{ transform: "scale(0.95)" }}
                                    mx={2}
                                    px={6}
                                    py={2}
                                    borderRadius="full"
                                    transition="all 0.2s"
                                >
                                    Search By Date
                                </Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <Menu>
                                        <MenuButton
                                            as={Button}
                                            rightIcon={<ChevronDownIcon />}
                                        >
                                            {selectedStation ?
                                                `${stationList.find(s => s.code === selectedStation).name} (${selectedStation})` :
                                                'Select Station'
                                            }
                                        </MenuButton>
                                        <MenuList maxH="300px" overflowY="auto">
                                            {stationList.map((station) => (
                                                <MenuItem
                                                    key={station.code}
                                                    onClick={() => setSelectedStation(station.code)}
                                                >
                                                    {`${station.name} (${station.code})`}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </Menu>

                                    <Button
                                        ml={3}
                                        onClick={handleSubmitStation}
                                        bgGradient="linear(to-r, #6366f1, #ec4899)"
                                        color="white"
                                        _hover={selectedStation && {
                                            bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                            transform: "scale(1.05)",
                                            boxShadow: "lg",
                                        }}
                                        _active={selectedStation && {
                                            bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                            transform: "scale(0.95)",
                                        }}
                                        isLoading={loading}
                                        isDisabled={!selectedStation}
                                    >
                                        Search
                                    </Button>
                                </TabPanel>
                                <TabPanel>
                                    <Flex gap={3} align="center" justifyContent="center">
                                        <Input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            size="md"
                                            borderRadius="md"
                                            maxW="200px"
                                            max="2025-03-09"
                                        />

                                        <Button
                                            onClick={handleSubmitDate}
                                            bgGradient="linear(to-r, #6366f1, #ec4899)"
                                            color="white"
                                            _hover={{
                                                bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                                transform: "scale(1.05)",
                                                boxShadow: "lg",
                                            }}
                                            _active={{
                                                bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                                transform: "scale(0.95)",
                                            }}
                                            isLoading={loading}
                                        >
                                            Search
                                        </Button>

                                        {data.length > 0 && advancedRenderReady === true && (
                                            <Button
                                                onClick={openAdvancedAnalysisModal}
                                                bgGradient="linear(to-r, #6366f1, #ec4899)"
                                                color="white"
                                                _hover={advancedAnalysisList.length >= 2 && advancedAnalysisList.length < 3 && {
                                                    bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                                    transform: "scale(1.05)",
                                                    boxShadow: "lg",
                                                }}
                                                _active={advancedAnalysisList.length >= 2 && advancedAnalysisList.length < 3 && {
                                                    bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                                    transform: "scale(0.95)",
                                                }}
                                                isLoading={advancedLoading}
                                                isDisabled={advancedAnalysisList.length < 2}
                                            >
                                                Advanced Analysis
                                            </Button>
                                        )}
                                    </Flex>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </MotionBox>

                    {displayedData.length > 0 && (
                        <MotionBox
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            mx="auto"
                            maxW="1200px"
                        >
                            <TableContainer bg="white" borderRadius="xl" boxShadow="xl">
                                <Table variant="striped">
                                    <Thead>
                                        <Tr>

                                            <Th>Station</Th>
                                            <Th>Date</Th>
                                            <Th cursor="pointer" onClick={sortDataAvg}>
                                                Avg Temp (°C)
                                                {sortOrderAvg === 'asc' ? ' ↑' : ' ↓'}
                                            </Th>
                                            <Th cursor="pointer" onClick={sortDataFD}>
                                                5-day Avg Temp (°C)
                                                {sortOrderFD === 'asc' ? ' ↑' : ' ↓'}
                                            </Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {displayedData.map((record) => {
                                            const stationInfo = stationList.find(s => s.code === record.Station);
                                            return (
                                                <Tr key={record._id}>
                                                    <Td>
                                                        <Box display="flex" gap={3}>
                                                            {activeTab === "date" && (
                                                                <Checkbox
                                                                    isChecked={advancedAnalysisList.includes(record.Station)}
                                                                    isDisabled={
                                                                        !advancedAnalysisList.includes(record.Station) &&
                                                                        advancedAnalysisList.length >= 3
                                                                    }
                                                                    onChange={(e) => handleCheckboxChange(e, record.Station)}
                                                                    borderColor={"gray.400"}
                                                                />
                                                            )}

                                                            {stationInfo ? `${stationInfo.name} (${record.Station})` : record.Station}
                                                        </Box>
                                                    </Td>
                                                    <Td>{record.Date}</Td>
                                                    <Td fontWeight="bold">{record.Avg}</Td>
                                                    <Td fontWeight="bold">{record.FDAvg}</Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </MotionBox>
                    )}
                </Box>

                <Box
                    as="footer"
                    position="fixed"
                    bottom="0"
                    left="0"
                    width="100%"
                    bg="white"
                    textAlign="left"
                    py={4}
                    borderTop="1px solid"
                    borderColor="gray.200"
                    zIndex="docked"
                    display="flex"
                    justifyContent="space-between"
                    px={4}
                >
                    <Text fontSize="sm" color="gray.600" alignContent={{ base: 'center', md: 'left' }} p={3}>
                        Data is only available until 9 March 2025.
                    </Text>
                    {activeTab === "date" && data.length > 0 && (
                        <Flex align="center">
                            <Text fontSize="sm" color="gray.600">
                                Showing {((currentPage - 1) * recordsPerPage) + 1} - {Math.min(currentPage * recordsPerPage, data.length)} of {data.length} records
                            </Text>

                            <IconButton
                                padding={0}
                                variant={'ghost'}
                                _hover={{ bg: 'none' }}
                                icon={<ChevronLeftIcon />}
                                onClick={handlePrevPage}
                                isDisabled={currentPage === 1}
                                aria-label="Previous Page"
                                mx={2}
                                fontSize="2xl"
                            />

                            <IconButton
                                padding={0}
                                variant={'ghost'}
                                _hover={{ bg: 'none' }}
                                icon={<ChevronRightIcon />}
                                onClick={handleNextPage}
                                isDisabled={currentPage === totalPages}
                                aria-label="Next Page"
                                mx={2}
                                fontSize="2xl"
                            />
                        </Flex>
                    )}
                </Box>
            </MotionBox>

            {isOpen && (
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <ModalContent>
                        <MotionBox
                            bgGradient="linear(to-r, #6366f1, #ec4899)"
                            color="white"
                            borderTopRadius="md"
                        >
                            <ModalHeader>Selected Stations Analysis</ModalHeader>
                            <ModalCloseButton color="white" />
                        </MotionBox>

                        <ModalBody>
                            <Stack spacing={4} py={4}>
                                <Flex align="center">
                                    <FiCalendar style={{ marginRight: '12px', fontSize: '1.2em' }} />
                                    <Text fontWeight="bold">{selectedDate}</Text>
                                </Flex>

                                <Box>
                                    <Text fontWeight="bold" mb={3} display="flex" alignItems="center">
                                        <FiMapPin style={{ marginRight: '12px', fontSize: '1.2em' }} />
                                        Selected Stations:
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {advancedAnalysisList.map(code => (
                                            <MotionBox
                                                key={code}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Tag
                                                    size="lg"
                                                    colorScheme="purple"
                                                    borderRadius="full"
                                                    variant="subtle"
                                                >
                                                    <TagLeftIcon as={FiMapPin} />
                                                    <TagLabel>
                                                        {stationList.find(s => s.code === code)?.name} ({code})
                                                    </TagLabel>
                                                </Tag>
                                            </MotionBox>
                                        ))}
                                    </Flex>
                                </Box>
                            </Stack>
                        </ModalBody>

                        <ModalFooter display="flex" flexDir={"column"}>
                            <Button
                                colorScheme="purple"
                                onClick={handleAdvancedAnalysis}
                                isLoading={advancedLoading}
                                bgGradient="linear(to-r, #6366f1, #ec4899)"
                                width="100%"
                                borderRadius="full"
                                _hover={{ bgGradient: 'linear(to-r, #6366f1, #ec4899)', opacity: 0.9 }}
                                mb={3}
                            >
                                Analyze Trends
                            </Button>

                            <Button
                                variant="outline"
                                colorScheme="purple"
                                onClick={onClose}
                                width={"100%"}
                                borderRadius="full"
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}

            <Modal isOpen={chartModalOpen} onClose={() => setChartModalOpen(false)} size="xl">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
                <ModalContent>
                    <MotionBox
                        bgGradient="linear(to-r, #6366f1, #ec4899)"
                        color="white"
                        borderTopRadius="md"
                    >
                        <ModalHeader>Advanced Analysis Complete</ModalHeader>
                        <ModalCloseButton />
                    </MotionBox>

                    <ModalBody>
                        {advancedData.length > 0 ? (
                            <TemperatureComparisonChart
                                data={
                                    advancedData.map(d => (
                                        { ...d, name: `${stationList.find(s => s.code === d.Station)?.name} (${d.Station})` }
                                    ))
                                }
                                date={selectedAnalysisDate}
                            />
                        ) : (
                            <Text textAlign="center" py={8}>No data available for comparison</Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Dashboard;