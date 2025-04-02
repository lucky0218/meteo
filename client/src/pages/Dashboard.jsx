/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { Heading, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Menu, MenuButton, MenuList, MenuItem, Flex, Input, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Text, IconButton, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Stack, Tag, TagLabel, TagLeftIcon, SimpleGrid, VStack, useDisclosure, HStack, useMediaQuery, FormControl, FormLabel, useBreakpointValue, CheckboxGroup, RadioGroup, Radio, CheckboxIcon, Divider } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useShowToast } from '../extensions/useShowToast';
import server from "../../networking";
import ByStationLineChart from '../components/ByStationLineChart';
import ByDateBarChart from '../components/ByDateBarChart';
import { FiArrowDown, FiArrowLeft, FiArrowUp, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import AvgAdvancedLineChart from '../components/AvgAdvanceLineChart';
import FiveDayAdvancedLineChart from '../components/5DayAdvanceLineChart';

const Dashboard = () => {
    const MotionBox = motion.div;

    const showToast = useShowToast();

    const { t, i18n } = useTranslation();

    const activeLanguage = i18n.language;
    const getDynamicDate = () => {
        const now = new Date();
        if (now.getHours() < 21) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return yesterday.toISOString().split('T')[0];
        } else {
            return now.toISOString().split('T')[0];
        }
    };

    const [selectedStation, setSelectedStation] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStations, setSelectedStations] = useState([]);
    const [confirmedStations, setConfirmedStations] = useState([]);
    const [selectedTempType, setSelectedTempType] = useState("avg");
    const [searchedStationCode, setSearchedStationCode] = useState(null);
    const [selectedStationName, setSelectedStationName] = useState("");
    const [startDate, setStartDate] = useState(getDynamicDate());
    const [endDate, setEndDate] = useState(getDynamicDate());
    const [selectedDate, setSelectedDate] = useState(getDynamicDate());
    const [loading, setLoading] = useState(false);
    const [advancedLoading, setAdvancedLoading] = useState(false);
    const [advancedRenderReady, setAdvancedRenderReady] = useState(false);
    const [data, setData] = useState([]);
    const [sortOrderDate, setSortOrderDate] = useState('desc');
    const [sortOrderAvg, setSortOrderAvg] = useState('desc');
    const [sortOrderFD, setSortOrderFD] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("station");
    const [advancedAnalysisList, setAdvancedAnalysisList] = useState([]);
    const [advancedData, setAdvancedData] = useState([]);
    const [selectedAnalysisDate, setSelectedAnalysisDate] = useState('');
    const [chartModalOpen, setChartModalOpen] = useState(false);
    const [isSorting, setIsSorting] = useState(false);
    const [chartKey, setChartKey] = useState(0);

    const recordsPerPage = activeTab === "station" ? 9 : 7;

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [screenIsNarrowerThan800px] = useMediaQuery("(max-width: 800px)");
    const [screenIsNarrowerThan700px] = useMediaQuery("(max-width: 700px)");
    const [screenIsNarrowerThan610px] = useMediaQuery("(max-width: 610px)");

    const sortAverageTemperature = useBreakpointValue({ base: t("avgTemp"), md: t("mdAvgTemp"), lg: t("avgTemp") });
    const sort5DayAverageTemperature = useBreakpointValue({ base: t("5-dayAvgTemp"), md: t("md5-dayAvgTemp"), lg: t("5-dayAvgTemp") });
    const avgTempLabel = useBreakpointValue({ base: t("baseAvgTemp"), md: t("mdAvgTemp"), lg: t("avgTemp") });
    const fdAvgTempLabel = useBreakpointValue({ base: t("base5-dayAvgTemp"), md: t("md5-dayAvgTemp"), lg: t("5-dayAvgTemp") });

    const handleSubmitStation = async () => {
        if (!selectedStation) return;
        setCurrentPage(1);
        setLoading(true);
        setSelectedStationName(stationList.find(s => s.code === selectedStation).name);
        setSearchedStationCode(selectedStation);
        try {
            let query = `station=${selectedStation}`;
            if (startDate) query += `&start=${startDate}`;
            if (endDate) query += `&end=${endDate}`;

            const response = await server.get(`/by_station?${query}`);
            setData(response.data.data);
            if (response.data.length === 0) {
                showToast(
                    "error",
                    "",
                    t("tryAnotherStationOrDate")
                );
            }
        } catch (error) {
            setData([]);
            if (error.response.data.success === false) {
                showToast(
                    "error",
                    t("error"),
                    error.response?.data?.error
                );
            }
        } finally {
            setLoading(false);
            setIsSorting(false);
            setSortOrderDate('desc');
            setSortOrderAvg('desc');
            setSortOrderFD('desc');
        }
    };

    const handleSubmitDate = async () => {
        if (!selectedDate) return;
        setCurrentPage(1);
        setLoading(true);
        try {
            const response = await server.get(`/by_date?date=${selectedDate}`);
            setData(response.data.data);
            setAdvancedRenderReady(true);
        } catch (error) {
            setData([]);
            if (error.response.data.success === false) {
                showToast(
                    "error",
                    t("error"),
                    error.response?.data?.error
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitMultipleStations = async () => {
        if (selectedStations.length === 0) return;
        setConfirmedStations(selectedStations);
        setCurrentPage(1);
        setLoading(true);
        try {
            let query = `stations=${selectedStations.join(",")}`;
            if (startDate) query += `&start=${startDate}`;
            if (endDate) query += `&end=${endDate}`;

            const response = await server.get(`/by_multiple_stations?${query}`);
            setData(response.data.data);
            if (response.data.length === 0) {
                showToast(
                    "error",
                    "",
                    t("tryAnotherStationOrDate")
                );
            }
        } catch (error) {
            setData([]);
            if (error.response.data.success === false) {
                showToast(
                    "error",
                    t("error"),
                    error.response?.data?.error
                );
            }
        } finally {
            setLoading(false);
            setIsSorting(false);
            setSortOrderDate('desc');
            setSortOrderAvg('desc');
            setSortOrderFD('desc');
        }
    }

    const handleStationsSelection = (stationCode) => {
        if (selectedStations.includes(stationCode)) {
            setSelectedStations(selectedStations.filter(code => code !== stationCode));
        } else {
            setSelectedStations([...selectedStations, stationCode]);
        }
    };

    const openAdvancedAnalysisModal = async () => {
        if (advancedAnalysisList.length < 2) {
            showToast(
                "error",
                t("selectAtLeastTwoStations")
            );
            return;
        } else if (advancedAnalysisList.length > 3) {
            showToast(
                "error",
                t("selectMaxThreeStations")
            );
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
                showToast(
                    "error",
                    t("error"),
                    error.response?.data?.error
                );
            }
        } finally {
            setAdvancedLoading(false);
            onClose();
        }
    };

    const getHottestAndColdestStations = (row) => {
        let hottestTemp = -Infinity;
        let coldestTemp = Infinity;
        let hottestStations = [];
        let coldestStations = [];

        confirmedStations.forEach(code => {
            const temp = selectedTempType === "avg"
                ? row[code]?.averageTemperature
                : row[code]?.fiveDayAverageTemperature;

            if (temp !== undefined && temp !== null) {
                if (temp > hottestTemp) {
                    hottestTemp = temp;
                    hottestStations = [code];
                } else if (temp === hottestTemp) {
                    hottestStations.push(code);
                }

                if (temp < coldestTemp) {
                    coldestTemp = temp;
                    coldestStations = [code];
                } else if (temp === coldestTemp) {
                    coldestStations.push(code);
                }
            }
        });

        return { hottestStations, coldestStations };
    }

    const getExtremeStations = (data) => {
        if (data.length === 0) return { hottestStations: [], coldestStations: [] };

        const maxAvg = Math.max(...data.map(d => d.Avg));
        const hottestCandidates = data.filter(d => d.Avg === maxAvg);

        const minAvg = Math.min(...data.map(d => d.Avg));
        const coldestCandidates = data.filter(d => d.Avg === minAvg);

        const resolveTie = (candidates, compareFn) => {
            if (candidates.length === 1) return candidates;
            const extremeFD = compareFn(...candidates.map(c => c.FDAvg));
            return candidates.filter(c => c.FDAvg === extremeFD);
        };

        return {
            hottestStations: resolveTie(hottestCandidates, Math.max),
            coldestStations: resolveTie(coldestCandidates, Math.min)
        };
    };

    const sortDataDate = () => {
        const sorted = [...data].sort((a, b) => {
            const dateA = new Date(a.Date || a.date);
            const dateB = new Date(b.Date || b.date);
            return sortOrderDate === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setData(sorted);
        setSortOrderDate(sortOrderDate === 'asc' ? 'desc' : 'asc');
        setSortOrderAvg('desc');
        setSortOrderFD('desc');
    };

    const sortDataAvg = () => {
        const sorted = [...data].sort((a, b) =>
            sortOrderAvg === 'asc' ? a.Avg - b.Avg : b.Avg - a.Avg
        );
        setData(sorted);
        setSortOrderAvg(sortOrderAvg === 'asc' ? 'desc' : 'asc');
        setSortOrderDate('desc');
        setSortOrderFD('desc');
    };

    const sortDataFD = () => {
        const sorted = [...data].sort((a, b) =>
            sortOrderFD === 'asc' ? a.FDAvg - b.FDAvg : b.FDAvg - a.FDAvg
        );
        setData(sorted);
        setSortOrderFD(sortOrderFD === 'asc' ? 'desc' : 'asc');
        setSortOrderDate('desc');
        setSortOrderAvg('desc');
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
        { code: 58349, name: t("Suzhou"), englishName: "Suzhou", chineseName: "苏州", image: "Suzhou.jpg" },
        { code: 58238, name: t("Nanjing"), englishName: "Nanjing", chineseName: "南京", image: "Nanjing.jpg" },
        { code: 58354, name: t("Wuxi"), englishName: "Wuxi", chineseName: "无锡", image: "Wuxi.jpg" },
        { code: 58343, name: t("Changzhou"), englishName: "Changzhou", chineseName: "常州", image: "Changzhou.jpg" },
        { code: 58252, name: t("Zhenjiang"), englishName: "Zhenjiang", chineseName: "镇江", image: "Zhenjiang.jpg" },
        { code: 58259, name: t("Nantong"), englishName: "Nantong", chineseName: "南通", image: "Nantong.jpg" },
        { code: 58246, name: t("Taizhou"), englishName: "Taizhou", chineseName: "泰州", image: "Taizhou.jpg" },
        { code: 58245, name: t("Yangzhou"), englishName: "Yangzhou", chineseName: "扬州", image: "Yangzhou.jpg" },
        { code: 58027, name: t("Xuzhou"), englishName: "Xuzhou", chineseName: "徐州", image: "Xuzhou.jpg" },
        { code: 58044, name: t("Lianyungang"), englishName: "Lianyungang", chineseName: "连云港", image: "Lianyungang.jpg" },
        { code: 58141, name: t("Huaian"), englishName: "Huaian", chineseName: "淮安", image: "Huaian.jpg" },
        { code: 58154, name: t("Yancheng"), englishName: "Yancheng", chineseName: "盐城", image: "Yancheng.jpg" },
        { code: 58131, name: t("Suqian"), englishName: "Suqian", chineseName: "宿迁", image: "Suqian.jpg" },
    ];

    const searchTermLower = searchTerm.toLowerCase();

    const filteredStations = stationList.filter(station =>
        station.name.toLowerCase().includes(searchTermLower) || 
        station.englishName.toLowerCase().includes(searchTermLower) || 
        station.chineseName.includes(searchTerm) 
    );
    const otherStations = stationList.filter(station => 
        !filteredStations.some(filtered => filtered.code === station.code)
    );

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

    const currentStartDate = displayedData[0]?.Date;
    const currentEndDate = displayedData[displayedData.length - 1]?.Date;

    const handleSort = (sortFunction) => {
        setIsSorting(true);
        sortFunction();
        setChartKey((prevKey) => prevKey + 1);
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
                            {t("dashboardTitle")}
                        </Heading>
                    </MotionBox>

                    <MotionBox
                        display="flex"
                        justifyContent="center"
                        mx="auto"
                        mb={15}
                    >
                        <Tabs variant='soft-rounded' colorScheme='green'>
                            <TabList display="flex" justifyContent="center" mt={10} mb={5}>
                                <Tab
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setActiveTab("station");
                                        setStartDate(startDate);
                                        setEndDate(endDate);
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
                                    {t("searchByStation")}
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
                                    {t("searchByDate")}
                                </Tab>
                                <Tab
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setActiveTab("tableAndLineChart");
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
                                    {t("tableAndLineChart")}
                                </Tab>
                            </TabList>
                            <TabPanels mb={4}>
                                <TabPanel>
                                    <Flex
                                        direction={{ base: "column", md: "row" }}
                                        gap={3}
                                        align="center"
                                        justify="center"
                                    >
                                        {/* First Row - Station Selection */}
                                        <Flex width={{ base: "100%", sm: "auto" }} justifyContent="center">
                                            <Menu>
                                                <MenuButton 
                                                    as={Button} 
                                                    rightIcon={<ChevronDownIcon />} 
                                                    w={{ base: "100%", sm: "auto" }} 
                                                    mt={{ base: 0, sm: 0, md: 7 }}
                                                >
                                                    {selectedStation ? `${stationList.find(s => s.code === selectedStation).name} (${selectedStation})` : t("selectStation")}
                                                </MenuButton>
                                                <MenuList maxH="300px" overflowY="auto">
                                                    <VStack p={2} spacing={2} align="stretch">
                                                        {/* Search Input */}
                                                        <Input
                                                            placeholder={`${t("searchAStation")}...`}
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                        <Divider />

                                                        {/* Searched Stations */}
                                                        {filteredStations.length > 0 ? (
                                                            <>
                                                                <Text fontWeight="bold">
                                                                    {searchTerm ? t("searched") : t("allStations")}
                                                                </Text>
                                                                {filteredStations.map(station => (
                                                                    <MenuItem 
                                                                        key={station.code} 
                                                                        onClick={() => setSelectedStation(station.code)}
                                                                    >
                                                                        {station.name} ({station.code})
                                                                    </MenuItem>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            <Text color="gray.500">{t("noStationsFound")}</Text>
                                                        )}

                                                        {/* Other Stations */}
                                                        {otherStations.length > 0 && (
                                                            <>
                                                                <Text fontWeight="bold">{t("others")}</Text>
                                                                {otherStations.map(station => (
                                                                    <MenuItem 
                                                                        key={station.code} 
                                                                        onClick={() => setSelectedStation(station.code)}
                                                                    >
                                                                        {station.name} ({station.code})
                                                                    </MenuItem>
                                                                ))}
                                                            </>
                                                        )}
                                                    </VStack>
                                                </MenuList>
                                            </Menu>
                                        </Flex>

                                        {/* Second Row - Start & End Date Inputs */}
                                        <Flex
                                            gap={3}
                                            justifyContent="center"
                                            direction={{ base: "column", sm: "row" }}
                                            width={{ base: "100%", sm: "auto" }}
                                        >
                                            <FormControl w={{ base: "100%", sm: "200px" }}>
                                                <FormLabel fontSize="sm" color="gray.300">{t("startDate")}</FormLabel>
                                                <Input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={e => setStartDate(e.target.value)}
                                                    size="md"
                                                    borderRadius="md"
                                                    w="100%"
                                                    max={getDynamicDate()}
                                                />
                                            </FormControl>

                                            <FormControl w={{ base: "100%", sm: "200px" }}>
                                                <FormLabel fontSize="sm" color="gray.300">{t("endDate")}</FormLabel>
                                                <Input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={e => setEndDate(e.target.value)}
                                                    size="md"
                                                    borderRadius="md"
                                                    w="100%"
                                                    max={getDynamicDate()}
                                                />
                                            </FormControl>
                                        </Flex>

                                        {/* Third Row - Search Button */}
                                        <Flex
                                            justifyContent="center"
                                            mt={{ base: 0, sm: 0, md: 7 }}
                                            width={{ base: "100%", sm: "auto" }}
                                        >
                                            <Button
                                                onClick={handleSubmitStation}
                                                bgGradient="linear(to-r, #6366f1, #ec4899)"
                                                color="white"
                                                w={{ base: "100%", sm: "auto" }}
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
                                                {t("search")}
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </TabPanel>
                                <TabPanel>
                                    <Flex
                                        direction={{ base: "column", md: "row" }}
                                        gap={3}
                                        align="center"
                                        justify="center"
                                    >
                                        {/* First Row - Input & Search Button */}
                                        <Flex
                                            gap={3}
                                            w={{ base: "100%", md: "auto" }}
                                            direction={{ base: "column", sm: "row" }}
                                            align="center"
                                            justifyContent={"center"}
                                        >
                                            <Input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                size="md"
                                                borderRadius="md"
                                                w={{ base: "100%", sm: "200px" }}
                                                display={"flex"}
                                                justifyContent={{ base: "center", sm: "flex-start" }}
                                                max={getDynamicDate()}
                                            />


                                            <Button
                                                onClick={handleSubmitDate}
                                                bgGradient="linear(to-r, #6366f1, #ec4899)"
                                                color="white"
                                                w={{ base: "100%", sm: "auto" }}
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
                                                {t("search")}
                                            </Button>
                                        </Flex>

                                        {/* Second Row - Advanced Analysis Button */}
                                        {data.length > 0 && advancedRenderReady === true && (
                                            <Button
                                                onClick={openAdvancedAnalysisModal}
                                                bgGradient="linear(to-r, #6366f1, #ec4899)"
                                                color="white"
                                                w={{ base: "100%", sm: "auto" }}
                                                _hover={advancedAnalysisList.length >= 2 && advancedAnalysisList.length <= 3 && {
                                                    bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                                    transform: "scale(1.05)",
                                                    boxShadow: "lg",
                                                }}
                                                _active={advancedAnalysisList.length >= 2 && advancedAnalysisList.length <= 3 && {
                                                    bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                                    transform: "scale(0.95)",
                                                }}
                                                isLoading={advancedLoading}
                                                isDisabled={advancedAnalysisList.length < 2}
                                            >
                                                {t("advancedAnalysis")}
                                            </Button>
                                        )}
                                    </Flex>
                                </TabPanel>
                                <TabPanel>
                                    <Flex
                                        direction={{ base: "column", md: "row" }}
                                        gap={3}
                                        align="center"
                                        justify="center"
                                    >
                                        {/* First Row - Multiple Station Selection */}
                                        <Flex width={{ base: "100%", sm: "auto" }} justifyContent="center">
                                            <Menu closeOnSelect={false}>
                                                <MenuButton
                                                    as={Button}
                                                    rightIcon={<ChevronDownIcon />}
                                                    w={{ base: "100%", sm: "auto" }}
                                                    mt={{ base: 0, sm: 0, md: 7 }}
                                                >
                                                    {selectedStations.length > 0
                                                        ? `${selectedStations.length} ${t("stationsSelected")}`
                                                        : t("selectMultipleStations")}
                                                </MenuButton>
                                                <MenuList maxH="300px" overflowY="auto">
                                                    <VStack p={2} spacing={2} align="stretch">
                                                        {/* Search Input */}
                                                        <Input
                                                            placeholder={t("Search station...")}
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                        <Divider />

                                                        {/* Stations List */}
                                                        {filteredStations.length > 0 ? (
                                                            <>
                                                                <Text fontWeight="bold">
                                                                    {searchTerm ? t("Searched Stations") : t("All Stations")}
                                                                </Text>
                                                                <CheckboxGroup value={selectedStations}>
                                                                    {filteredStations.map(station => (
                                                                        <MenuItem key={station.code} as="div">
                                                                            <Checkbox
                                                                                value={station.code}
                                                                                isChecked={selectedStations.includes(station.code)}
                                                                                onChange={() => handleStationsSelection(station.code)}
                                                                                colorScheme="purple"
                                                                            >
                                                                                {station.name} ({station.code})
                                                                            </Checkbox>
                                                                        </MenuItem>
                                                                    ))}
                                                                </CheckboxGroup>
                                                            </>
                                                        ) : (
                                                            <Text color="gray.500">{t("No stations found")}</Text>
                                                        )}

                                                        {/* Other Stations */}
                                                        {otherStations.length > 0 && (
                                                            <>
                                                                <Text fontWeight="bold">{t("others")}</Text>
                                                                <CheckboxGroup value={selectedStations}>
                                                                    {otherStations.map(station => (
                                                                        <MenuItem key={station.code} as="div">
                                                                            <Checkbox
                                                                                value={station.code}
                                                                                isChecked={selectedStations.includes(station.code)}
                                                                                onChange={() => handleStationsSelection(station.code)}
                                                                                colorScheme="purple"
                                                                            >
                                                                                {station.name} ({station.code})
                                                                            </Checkbox>
                                                                        </MenuItem>
                                                                    ))}
                                                                </CheckboxGroup>
                                                            </>
                                                        )}
                                                    </VStack>
                                                </MenuList>
                                            </Menu>
                                        </Flex>
                                        {/* Second Row - Start & End Date Inputs */}
                                        <Flex
                                            gap={3}
                                            justifyContent="center"
                                            direction={{ base: "column", sm: "row" }}
                                            width={{ base: "100%", sm: "auto" }}
                                        >
                                            <FormControl w={{ base: "100%", sm: "200px" }}>
                                                <FormLabel fontSize="sm" color="gray.300">{t("startDate")}</FormLabel>
                                                <Input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={e => setStartDate(e.target.value)}
                                                    size="md"
                                                    borderRadius="md"
                                                    w="100%"
                                                    max={getDynamicDate()}
                                                />
                                            </FormControl>

                                            <FormControl w={{ base: "100%", sm: "200px" }}>
                                                <FormLabel fontSize="sm" color="gray.300">{t("endDate")}</FormLabel>
                                                <Input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={e => setEndDate(e.target.value)}
                                                    size="md"
                                                    borderRadius="md"
                                                    w="100%"
                                                    max={getDynamicDate()}
                                                />
                                            </FormControl>
                                        </Flex>

                                        {/* Third Row - Search Button */}
                                        <Flex
                                            justifyContent="center"
                                            mt={{ base: 0, sm: 0, md: 7 }}
                                            width={{ base: "100%", sm: "auto" }}
                                        >
                                            <Button
                                                onClick={handleSubmitMultipleStations}
                                                bgGradient="linear(to-r, #6366f1, #ec4899)"
                                                color="white"
                                                w={{ base: "100%", sm: "auto" }}
                                                _hover={selectedStations.length > 0 && {
                                                    bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                                    transform: "scale(1.05)",
                                                    boxShadow: "lg",
                                                }}
                                                _active={selectedStations.length > 0 && {
                                                    bgGradient: "linear(to-r, #6366f1, #ec4899)",
                                                    transform: "scale(0.95)",
                                                }}
                                                isLoading={loading}
                                                isDisabled={selectedStations.length <= 1}
                                            >
                                                {t("search")}
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </MotionBox>

                    {displayedData.length > 0 && activeTab === "date" && (
                        !screenIsNarrowerThan610px ? (
                            <MotionBox
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                mx="auto"
                                maxW="1200px"
                            >
                                <TableContainer bg="white" borderRadius="xl" boxShadow="xl" mb="8rem" mx={{ base: "2rem", md: "4rem", lg: "8rem" }}>
                                    <Table>
                                        <Thead bg="gray.100">
                                            <Tr>

                                                <Th>{t("station")}</Th>
                                                <Th>{t("date")}</Th>
                                                <Th cursor="pointer" onClick={sortDataAvg}>
                                                    <Flex alignItems="center" gap={2}>
                                                        {t("avgTemp")}(°C)
                                                        <Text fontSize="xl">
                                                            {sortOrderAvg === 'asc' ? ' ↑' : ' ↓'}
                                                        </Text>
                                                    </Flex>
                                                </Th>
                                                <Th cursor="pointer" onClick={sortDataFD}>
                                                    <Flex alignItems="center" gap={2}>
                                                        {t("5-dayAvgTemp")}(°C)
                                                        <Text fontSize="xl">
                                                            {sortOrderFD === 'asc' ? ' ↑' : ' ↓'}
                                                        </Text>
                                                    </Flex>
                                                </Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {displayedData.map((record) => {
                                                const { hottestStations, coldestStations } = getExtremeStations(data);
                                                const stationInfo = stationList.find(s => s.code === record.Station);
                                                const isHottest = hottestStations.some(h => h.Station === record.Station);
                                                const isColdest = coldestStations.some(c => c.Station === record.Station);

                                                return (
                                                    <Tr key={record._id} bg={isHottest ? 'red.50' : isColdest ? 'blue.50' : 'white'}>
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
                                                                        colorScheme="purple"
                                                                        icon={<CheckboxIcon bg="linear-gradient(45deg, #6366f1, #ec4899)" />}
                                                                        size="lg"
                                                                    />
                                                                )}
                                                                {screenIsNarrowerThan700px ? stationInfo.name : `${stationInfo.name} (${record.Station})`}
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
                        ) : (
                            <Text textAlign="center" fontSize="xl" fontWeight="bold" color="gray.500" p={10}>
                                {t("tableNotSupported")}
                            </Text>
                        )
                    )}

                    {displayedData.length > 0 && activeTab === "station" && (
                        <MotionBox
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            mx="auto"
                        >
                            <Box
                                alignItems="center"
                                w="95%"
                                margin="auto"
                                minH="52rem"
                                position="relative"
                                overflow="hidden"
                                sx={{
                                    perspective: '1000px',
                                    transformStyle: 'preserve-3d',
                                }}
                                borderRadius={50}
                            >
                                {/* Background */}
                                <Box
                                    position="fixed"
                                    top={0}
                                    left={0}
                                    w="100%"
                                    h="100%"
                                    backgroundImage={stationList.find(s => s.code === searchedStationCode)?.image}
                                    backgroundSize="cover"
                                    backgroundPosition="center"
                                    transform="translateZ(-1px) scale(1.2)"
                                    filter="auto blur(3px) brightness(0.5)"
                                    sx={{
                                        willChange: 'transform',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.3) 100%)',
                                        }
                                    }}
                                />

                                {/* Title */}
                                <Box
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    textAlign="center"
                                    position="relative"
                                    zIndex={1}
                                    mb={4}
                                    mt={2}
                                >
                                    <Text
                                        fontSize={{ base: '4xl', md: '8xl' }}
                                        fontWeight="black"
                                        sx={{
                                            fontFamily: 'var(--font-calligraphy)',
                                            position: 'relative',
                                            color: 'white',
                                            textShadow: '4px 4px 8px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {selectedStationName ? stationList.find(s => s.code === searchedStationCode)?.name : "Station"}
                                    </Text>
                                </Box>

                                {/* Sorting Controls */}
                                <MotionBox
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    maxW="1400px"
                                    mx="auto"
                                    mt={8}
                                    px={4}
                                    display="flex"
                                    flexDirection={{ base: 'column', md: 'row' }}
                                    gap={4}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {['date', 'avg', 'FD'].map((sortType) => {
                                        const sortOrder = {
                                            date: sortOrderDate,
                                            avg: sortOrderAvg,
                                            FD: sortOrderFD
                                        }[sortType];

                                        const sortFunction = {
                                            date: sortDataDate,
                                            avg: sortDataAvg,
                                            FD: sortDataFD
                                        }[sortType];

                                        return (
                                            <Button
                                                key={sortType}
                                                rightIcon={sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                                                onClick={() => handleSort(sortFunction)}
                                                variant="solid"
                                                bgGradient={sortOrder === 'asc'
                                                    ? "linear(to-r, #6366f1, #ec4899)"
                                                    : "linear(to-r, #ec4899, #6366f1)"}
                                                color="white"
                                                _hover={{
                                                    bgGradient: sortOrder === 'asc'
                                                        ? "linear(to-r, #4f46e5, #db2777)"
                                                        : "linear(to-r, #db2777, #4f46e5)",
                                                    transform: "scale(1.05)"
                                                }}
                                                _active={{ transform: "scale(0.95)" }}
                                                px={{ base: 4, md: 6 }}
                                                borderRadius={10}
                                                mx={2}
                                                w={{ base: '80%', md: 'auto' }}
                                                mb={{ base: 4, md: 0 }}
                                                boxShadow="xl"
                                            >
                                                {`${t("sortBy")
                                                    } ${{
                                                        date: t("date"),
                                                        avg: sortAverageTemperature,
                                                        FD: sort5DayAverageTemperature
                                                    }[sortType]}`}
                                            </Button>
                                        )
                                    })}
                                </MotionBox>

                                {/* Weather Cards */}
                                <SimpleGrid
                                    columns={{ base: 1, md: 3 }}
                                    spacing={6}
                                    maxW="1400px"
                                    mx="auto"
                                    mt={4}
                                    px={8}
                                    py={8}
                                    position="relative"
                                    zIndex={1}
                                >
                                    {displayedData.map((record) => (
                                        <MotionBox
                                            key={record._id}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            whileHover={{ y: -10 }}
                                            transition={{ type: 'spring', stiffness: 200 }}
                                            position="relative"
                                        >
                                            <Box
                                                bg="rgba(255, 255, 255, 0.8)"
                                                border="1px solid"
                                                borderColor="whiteAlpha.700"
                                                borderRadius="2xl"
                                                p={{ base: 4, md: 6 }}
                                                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.3)"
                                                position="relative"
                                                overflow="hidden"
                                                h={{ base: "140px", md: "160px" }}
                                                display="flex"
                                                flexDirection="column"
                                                _before={{
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: '-50%',
                                                    left: '-50%',
                                                    w: '200%',
                                                    h: '200%',
                                                    bg: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)'
                                                }}
                                            >
                                                <VStack spacing={4} align="stretch" flex={1} justifyContent="space-between">
                                                    {/* Date Header */}
                                                    <Flex justify="space-between" align="center">
                                                        <Box
                                                            bgGradient="linear(to-r, #6366f1, #ec4899)"
                                                            px={4}
                                                            py={1}
                                                            borderRadius={10}
                                                        >
                                                            <Text fontSize="sm" fontWeight="bold" color="white">
                                                                {record.Date}
                                                            </Text>
                                                        </Box>
                                                    </Flex>

                                                    {/* Temperature Section */}
                                                    <Box position="relative" flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
                                                        <Flex align="center" justify="space-between" flex={1}>
                                                            <Box>
                                                                <Text
                                                                    fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                                                                    fontWeight="black"
                                                                    color="gray.800"
                                                                    lineHeight="1"
                                                                >
                                                                    {record.Avg}°C
                                                                </Text>
                                                                <Text fontSize={{ md: 'xs', lg: 'sm' }} color="gray.600" mt={1}>
                                                                    {avgTempLabel}
                                                                </Text>
                                                            </Box>
                                                            <Box textAlign="right">
                                                                <Text
                                                                    display="inline-flex"
                                                                    alignItems="center"
                                                                    lineHeight="2"
                                                                    fontSize={{ base: 'md', md: 'lg', lg: "xl" }}
                                                                    fontWeight="bold"
                                                                    gap={1}
                                                                    color={record.FDAvg > record.Avg ? 'red.600' : record.FDAvg === record.Avg ? "green.600" : 'blue.600'}
                                                                >
                                                                    {record.FDAvg.toFixed(1)}°C
                                                                    <Box as="span" display="inline-block" mt="2px">
                                                                        {record.FDAvg > record.Avg ? (
                                                                            <FiArrowUp />
                                                                        ) : record.FDAvg === record.Avg ? (
                                                                            <FiArrowLeft />
                                                                        ) : (
                                                                            <FiArrowDown />
                                                                        )}
                                                                    </Box>
                                                                </Text>
                                                                <Text fontSize={{ md: 'xs', lg: 'sm' }} color="gray.600">
                                                                    {fdAvgTempLabel}
                                                                </Text>
                                                            </Box>
                                                        </Flex>
                                                    </Box>
                                                </VStack>
                                            </Box>
                                        </MotionBox>
                                    ))}
                                </SimpleGrid>
                            </Box>

                            {/* Weather Data Trend Chart */}
                            {data.length > 0 && (
                                <MotionBox
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    mx="auto"
                                    maxW="1200px"
                                    mt={8}
                                    bg="white"
                                    borderRadius="xl"
                                    boxShadow="xl"
                                    p={{ base: 4, md: 6 }}
                                    textAlign="center"
                                    mb={16}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Heading size="md" mb={4} bgGradient="linear(to-r, #6366f1, #ec4899)" bgClip="text" fontSize={{ base: '3xl', md: '4xl' }} mt={14}>
                                        {activeLanguage === "en"
                                            ? `${t("weatherDataTrendIn")} ${selectedStationName ? stationList.find(s => s.code === searchedStationCode)?.name : "Station"}`
                                            : `${selectedStationName ? stationList.find(s => s.code === searchedStationCode)?.name : "Station"} ${t("weatherDataTrendIn")}`
                                        }
                                    </Heading>
                                    <Box h={{ base: '40vh', md: '50vh' }} w="90vw" mb={32} alignItems="center" justifyContent="center" mx="auto" position="relative">
                                        {!isSorting ? (
                                            <ByStationLineChart
                                                key={chartKey}
                                                data={data}
                                                xAxisKey="Date"
                                                yAxisKeys={["Avg", "FDAvg"]}
                                                currentStartDate={currentStartDate}
                                                currentEndDate={currentEndDate}
                                                selectedStationName={stationList.find(s => s.code === searchedStationCode)?.name}
                                            />
                                        ) : (
                                            <VStack spacing={4} align="center" justify="center">
                                                <Text fontSize="xl" fontWeight="bold" color="gray.500" textAlign="center">
                                                    {t("lineChartNotSupported")}
                                                </Text>
                                                <HStack spacing={2}>
                                                    <Text fontSize="xl" fontWeight="bold" color="gray.500">
                                                        {t("click")}
                                                    </Text>
                                                    <Button
                                                        onClick={handleSubmitStation} // Same function as the search button
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
                                                        isDisabled={!selectedStation}
                                                        size="md"
                                                        px={4}
                                                        borderRadius={8}
                                                    >
                                                        {t("here")}
                                                    </Button>
                                                    <Text fontSize="xl" fontWeight="bold" color="gray.500">
                                                        {t("toViewItAgain")}
                                                    </Text>
                                                </HStack>
                                            </VStack>

                                        )}
                                    </Box>
                                </MotionBox>
                            )}
                        </MotionBox>
                    )}

                    {displayedData.length > 0 && activeTab === "tableAndLineChart" && (
                        <>
                            {!screenIsNarrowerThan610px ? (
                                <MotionBox
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    mx="auto"
                                    maxW="1200px"
                                >
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        mb={8}
                                        position="relative"
                                    >
                                        <Box
                                            position="absolute"
                                            zIndex={-1}
                                        />

                                        <RadioGroup onChange={setSelectedTempType} value={selectedTempType}>
                                            <HStack
                                                spacing={4}
                                                p={4}
                                                borderRadius="2xl"
                                                bg="whiteAlpha.100"
                                                backdropFilter="blur(12px)"
                                                boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
                                            >
                                                {['avg', '5dayAvg'].map((value) => (
                                                    <Radio
                                                        hidden={true}
                                                        key={value}
                                                        value={value}
                                                        size="lg"
                                                        colorScheme="purple"
                                                        _hover={{ transform: 'scale(1.05)' }}
                                                        _active={{ transform: 'scale(0.95)' }}
                                                        transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                                                        sx={{
                                                            'span:first-of-type': {
                                                                w: 8,
                                                                h: 8,
                                                                border: '2px solid',
                                                                borderColor: 'whiteAlpha.400',
                                                                _checked: {
                                                                    borderColor: 'purple.500',
                                                                    bg: 'transparent',
                                                                    '> span': {
                                                                        transform: 'scale(0.6)',
                                                                        bg: 'linear-gradient(45deg, #6366f1, #ec4899)'
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Box
                                                            position="relative"
                                                            p={3}
                                                            borderRadius="xl"
                                                            bg={selectedTempType === value ?
                                                                'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))' :
                                                                'transparent'}
                                                            border="2px solid"
                                                            borderColor={selectedTempType === value ? 'purple.500' : 'whiteAlpha.200'}
                                                            boxShadow={selectedTempType === value ?
                                                                '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'}
                                                            transition="all 0.3s ease-out"
                                                        >
                                                            <Text
                                                                fontSize="xl"
                                                                fontWeight="bold"
                                                                bg={selectedTempType === value ?
                                                                    'linear-gradient(45deg, #6366f1, #ec4899)' :
                                                                    'none'}
                                                                bgClip="text"
                                                                color={selectedTempType === value ? 'transparent' : ""}
                                                            >
                                                                {value === 'avg' ? t("avgTemp") : t("5-dayAvgTemp")}
                                                            </Text>
                                                        </Box>
                                                    </Radio>
                                                ))}
                                            </HStack>
                                        </RadioGroup>
                                    </Box>

                                    <TableContainer bg="white" borderRadius="xl" boxShadow="xl" mb="8rem" mx={{ base: "2rem", md: "4rem", lg: "8rem" }}>
                                        <Table variant="striped">
                                            <Thead>
                                                <Tr>
                                                    <Th cursor="pointer" onClick={() => handleSort(sortDataDate)}>
                                                        <Flex alignItems="center" gap={2}>
                                                            {t("date")}
                                                            <Text fontSize="xl">
                                                                {sortOrderDate === 'asc' ? ' ↑' : ' ↓'}
                                                            </Text>
                                                        </Flex>
                                                    </Th>
                                                    {confirmedStations.map(code => {
                                                        const stationInfo = stationList.find(s => s.code === code);
                                                        return (
                                                            <Th key={code}>
                                                                {stationInfo ? `${stationInfo.name} (${code})` : `Station ${code}`}
                                                            </Th>
                                                        );
                                                    })}
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {displayedData.map((row, index) => {
                                                    const { hottestStations, coldestStations } = getHottestAndColdestStations(row);

                                                    return (
                                                        <Tr key={index}>
                                                            <Td>{row.date}</Td>
                                                            {confirmedStations.map(code => {
                                                                const temp = selectedTempType === "avg"
                                                                    ? row[code]?.averageTemperature
                                                                    : row[code]?.fiveDayAverageTemperature;

                                                                const isHottest = hottestStations.includes(code);
                                                                const isColdest = coldestStations.includes(code);
                                                                const isNA = temp === undefined || temp === null;

                                                                return (
                                                                    <Td key={code}>
                                                                        <Text
                                                                            fontWeight="bold"
                                                                            color={isNA ? "gray.400" : isHottest ? "red.500" : isColdest ? "blue.500" : "gray.700"}
                                                                        >
                                                                            {isNA ? "N/A" : `${temp.toFixed(1)}°C`}
                                                                        </Text>
                                                                    </Td>
                                                                );
                                                            })}
                                                        </Tr>
                                                    );
                                                })}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                </MotionBox>
                            ) : (
                                <Text textAlign="center" fontSize="xl" fontWeight="bold" color="gray.500" p={10}>
                                    {t("tableNotSupported")}
                                </Text>
                            )}

                            {displayedData.length > 0 && activeTab === "tableAndLineChart" && (
                                <MotionBox
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    mx="auto"
                                    maxW="1200px"
                                    mt={8}
                                    bg="white"
                                    borderRadius="xl"
                                    boxShadow="xl"
                                    p={{ base: 4, md: 6 }}
                                    textAlign="center"
                                    mb={16}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Heading size="md" mb={4} bgGradient="linear(to-r, #6366f1, #ec4899)" bgClip="text" fontSize={{ base: '3xl', md: '4xl' }} mt={14}>
                                        {t("weatherDataTrendIn")}
                                    </Heading>
                                    <Box h={{ base: '40vh', md: '50vh' }} w="90vw" mb={32} alignItems="center" justifyContent="center" mx="auto" position="relative">
                                        {!isSorting ? (
                                            selectedTempType === "avg" ? (
                                                <AvgAdvancedLineChart
                                                    key={chartKey}
                                                    data={displayedData}
                                                    xAxisKey="date"
                                                    stations={confirmedStations || []}
                                                    currentStartDate={currentStartDate}
                                                    currentEndDate={currentEndDate}
                                                    tempType={selectedTempType}
                                                />
                                            ) : (
                                                <FiveDayAdvancedLineChart
                                                    key={chartKey}
                                                    data={displayedData}
                                                    xAxisKey="date"
                                                    stations={confirmedStations || []}
                                                    currentStartDate={currentStartDate}
                                                    currentEndDate={currentEndDate}
                                                    tempType={selectedTempType}
                                                />
                                            )
                                        ) : (
                                            <VStack spacing={4} align="center" justify="center">
                                                <Text fontSize="xl" fontWeight="bold" color="gray.500" textAlign="center">
                                                    {t("lineChartNotSupported")}
                                                </Text>
                                                <HStack spacing={2}>
                                                    <Text fontSize="xl" fontWeight="bold" color="gray.500">
                                                        {t("click")}
                                                    </Text>
                                                    <Button
                                                        onClick={handleSubmitMultipleStations} // Same function as the search button
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
                                                        size="md"
                                                        px={4}
                                                        borderRadius={8}
                                                    >
                                                        {t("here")}
                                                    </Button>
                                                    <Text fontSize="xl" fontWeight="bold" color="gray.500">
                                                        {t("toViewItAgain")}
                                                    </Text>
                                                </HStack>
                                            </VStack>

                                        )}
                                    </Box>
                                </MotionBox>
                            )}
                        </>
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
                    py={2}
                    borderTop="1px solid #e2e8f0"
                    borderColor="purple.100"
                    zIndex="docked"
                    display="flex"
                    justifyContent="space-between"
                    px={2}
                >
                    {(!screenIsNarrowerThan800px || data.length === 0) && (
                        <Text fontSize="sm" color="gray.600" alignContent={{ base: 'center', md: 'left' }} p={3}>
                            {t("footerLeft")}
                        </Text>
                    )}

                    {data.length > 0 && (
                        <Flex align="center">
                            <Text fontSize="sm" color="gray.600">
                                {t("paginationMessage", {
                                    start: ((currentPage - 1) * recordsPerPage) + 1,
                                    end: Math.min(currentPage * recordsPerPage, data.length),
                                    total: data.length,
                                    recordText: data.length === 1 ? t("record") : t("records")
                                })}
                            </Text>

                            <IconButton
                                padding={0}
                                variant={'ghost'}
                                color={currentPage === 1 ? 'gray.400' : '#4F46E5'}
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
                                color={currentPage === totalPages ? 'gray.400' : '#4F46E5'}
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
                            <ModalHeader>{t("selectedStationsAnalysis")}</ModalHeader>
                            <ModalCloseButton color="black" />
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
                                        {t("selectedStations")}
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
                                {t("analyzeTrends")}
                            </Button>

                            <Button
                                variant="outline"
                                colorScheme="purple"
                                onClick={onClose}
                                width={"100%"}
                                borderRadius="full"
                            >
                                {t("cancel")}
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
                        <ModalHeader>{t("advancedAnalysisComplete")}</ModalHeader>
                        <ModalCloseButton />
                    </MotionBox>

                    <ModalBody>
                        {advancedData.length > 0 ? (
                            <ByDateBarChart
                                data={advancedData.map(d => ({
                                    ...d,
                                    name: `${stationList.find(s => s.code === d.Station)?.name} (${d.Station})`
                                }))}
                                date={selectedAnalysisDate}
                            />
                        ) : (
                            <Text textAlign="center" py={8}>{t("noDataAvailableForComparison")}</Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Dashboard;