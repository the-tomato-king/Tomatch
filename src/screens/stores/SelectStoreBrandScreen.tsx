import React from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StoreStackParamList } from "../../types/navigation";
import { StoreBrand } from "../../types";
import { useBrands } from "../../hooks/useBrands";
import StoreLogo from "../../components/StoreLogo";
import SearchBar from "../../components/search/SearchBar";
import { Text } from "react-native";

type SelectStoreBrandScreenRouteProp = RouteProp<
  StoreStackParamList,
  "SelectStoreBrand"
>;

const SelectStoreBrandScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const route = useRoute<SelectStoreBrandScreenRouteProp>();
  const { brands, loading } = useBrands();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredBrands = React.useMemo(() => {
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [brands, searchQuery]);

  const handleSelectBrand = (brand: StoreBrand) => {
    route.params.onSelect(brand);
    navigation.goBack();
  };

  const renderBrandItem = ({ item }: { item: StoreBrand }) => (
    <TouchableOpacity
      style={styles.brandItem}
      onPress={() => handleSelectBrand(item)}
    >
      <View style={styles.logoContainer}>
        <StoreLogo brand={item.logo} width={40} height={40} />
      </View>
      <Text style={styles.brandName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search store brands..."
      />
      <FlatList
        data={filteredBrands}
        renderItem={renderBrandItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  brandItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoContainer: {
    marginRight: 12,
  },
  brandName: {
    fontSize: 16,
  },
});

export default SelectStoreBrandScreen;
