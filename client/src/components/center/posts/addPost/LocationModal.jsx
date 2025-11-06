import { useState } from "react";
import { Modal, Input, Button, List, Spin, Empty, Tag, message } from "antd";
import { AimOutlined, EnvironmentOutlined } from "@ant-design/icons";

const LocationModal = ({ isLocationModalOpen, closeLocationModal, handleSelectLocation, selectedLocation, setSelectedLocation }) => {
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            message.error("Geolocation is not supported by your browser.");
            return;
        }
        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    if (data && data.display_name) {
                        setLocationSuggestions([
                            { place_id: data.place_id, display_name: data.display_name },
                        ]);
                    } else {
                        message.error("Could not find location name.");
                    }
                } catch (error) {
                    message.error("Failed to fetch location data.");
                } finally {
                    setIsLoadingLocation(false);
                }
            },
            () => {
                setIsLoadingLocation(false);
                message.error("Unable to retrieve your location.");
            }
        );
    };

    const handleSearchLocation = async (value) => {
        if (!value || value.trim().length < 3) {
            setLocationSuggestions([]);
            return;
        }
        setIsLoadingLocation(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    value
                )}&limit=5`
            );
            const data = await response.json();
            setLocationSuggestions(data || []);
        } catch (error) {
            message.error("Failed to search for locations.");
        } finally {
            setIsLoadingLocation(false);
        }
    };

    return (
        <Modal
            title="Tag location"
            open={isLocationModalOpen}
            onCancel={closeLocationModal}
            footer={null}
        >
            <Input.Search
                placeholder="Search for places"
                onSearch={handleSearchLocation}
                onChange={(e) => handleSearchLocation(e.target.value)}
                style={{ marginBottom: 16 }}
                enterButton
                loading={isLoadingLocation}
            />
            <Button
                icon={<AimOutlined />}
                onClick={handleGetCurrentLocation}
                style={{ marginBottom: 16 }}
                block
            >
                Use current location
            </Button>
            <Spin spinning={isLoadingLocation}>
                {locationSuggestions.length > 0 ? (
                    <List
                        bordered
                        dataSource={locationSuggestions}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => handleSelectLocation(item)}
                                style={{ cursor: "pointer" }}
                            >
                                <List.Item.Meta
                                    avatar={<EnvironmentOutlined />}
                                    title={item.display_name?.split(",")[0]}
                                    description={item.display_name}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="No location found." />
                )}
            </Spin>
            {selectedLocation && (
                <Tag
                    closable
                    onClose={() => setSelectedLocation(null)}
                    style={{ marginTop: 16 }}
                    icon={<EnvironmentOutlined />}
                >
                    Selected: {selectedLocation.display_name?.split(",")[0]}
                </Tag>
            )}
        </Modal>
    );
};

export default LocationModal;
