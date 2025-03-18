/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { Heading, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Menu, MenuButton, MenuList, MenuItem, Flex, Input, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Text, IconButton, Checkbox } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useShowToast } from '../extensions/useShowToast';
import server from "../../networking";

const Dashboard = () => {
    const MotionBox = motion.div;

    const showToast = useShowToast();

    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [advancedLoading, setAdvancedLoading] = useState(false);
    const [advancedRenderReady, setAdvancedRenderReady] = useState(false);
    const [data, setData] = useState([]);
    const [sortOrderAvg, setSortOrderAvg] = useState('desc');
    const [sortOrderFD, setSortOrderFD] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("station");
    const [advancedAnalysisList, setAdvancedAnalysisList] = useState([]);
    const recordsPerPage = 7;

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
            setData(response.data);
            setAdvancedRenderReady(true);
            if (response.data.length === 0) {
                showToast("error", "No data found", "Please try another date");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdvancedAnalysis = async () => {
        console.log("Selected station codes for advanced analysis:", advancedAnalysisList);
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
                                            onClick={handleAdvancedAnalysis}
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
    );
};

export default Dashboard;