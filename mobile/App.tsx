import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { getApiUrl } from "./src/api-url";
type Movie = {
  id: number;
  titulo: string;
  director: string;
  duracion: number;
  categoriaId: number;
  categoria: string;
  sinopsis: string;
  color: string;
  estreno: boolean;
};
type Category = { id: number; nombre: string };
const API = getApiUrl(
  process.env.EXPO_PUBLIC_API_URL,
  Constants.expoConfig?.hostUri,
  __DEV__,
);
async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const r = await fetch(API + path, { signal: controller.signal });
    if (!r.ok) throw Error("API");
    return await r.json();
  } finally {
    clearTimeout(timeout);
  }
}
function Poster({ movie, large = false }: { movie: Movie; large?: boolean }) {
  return (
    <View
      style={[
        s.poster,
        { backgroundColor: movie.color || "#6654da" },
        large && { height: 350 },
      ]}
    >
      <View style={s.orbit} />
      <View style={s.planet} />
      <Text style={s.mark}>C / {String(movie.id).padStart(2, "0")}</Text>
      <View>
        <Text style={s.caption}>UNA HISTORIA POR DESCUBRIR</Text>
        <Text style={[s.posterTitle, large && { fontSize: 38 }]}>
          {movie.titulo}
        </Text>
        <Text style={s.credit}>{movie.director}</Text>
      </View>
    </View>
  );
}
function CineApp() {
  const { width } = useWindowDimensions();
  const columns = width > 1000 ? 4 : width > 650 ? 3 : 2;
  const [movies, setMovies] = useState<Movie[]>([]),
    [categories, setCategories] = useState<Category[]>([]),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true),
    [refreshing, setRefreshing] = useState(false),
    [error, setError] = useState(""),
    [source, setSource] = useState("");
  const [selected, setSelected] = useState<Movie | null>(null),
    [detailLoading, setDetailLoading] = useState(false),
    [detailError, setDetailError] = useState("");
  async function load(refresh = false) {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [catalog, genres, health] = await Promise.all([
        request<{ data: Movie[] }>("/peliculas"),
        request<{ data: Category[] }>("/categorias"),
        request<{ source: string }>("/health"),
      ]);
      setMovies(catalog.data);
      setCategories(genres.data);
      setSource(health.source);
    } catch {
      setError(
        "Revisa que el backend esté encendido y la dirección de la API sea correcta.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function open(movie: Movie) {
    setSelected(movie);
    setDetailLoading(true);
    setDetailError("");
    try {
      const r = await request<{ data: Movie }>("/peliculas/" + movie.id);
      setSelected((current) => (current?.id === movie.id ? r.data : current));
    } catch {
      setDetailError(
        "No se pudo actualizar el detalle. Se muestra la información de la cartelera.",
      );
    } finally {
      setDetailLoading(false);
    }
  }
  const filtered = movies.filter(
    (m) =>
      (category === null || m.categoriaId === category) &&
      m.titulo
        .toLocaleLowerCase("es")
        .includes(query.trim().toLocaleLowerCase("es")),
  );
  const featured = movies[0];
  const button = (label: string, action: () => void) => (
    <Pressable accessibilityRole="button" onPress={action} style={s.button}>
      <Text style={s.buttonText}>{label}</Text>
    </Pressable>
  );
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.container}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>
              cine<Text style={{ color: "#d7fa70" }}>app ●</Text>
            </Text>
            <Text style={s.tagline}>TU PRÓXIMA HISTORIA EMPIEZA AQUÍ</Text>
          </View>
          <Text style={s.badge}>CARTELERA</Text>
        </View>
        <FlatList
          data={filtered}
          key={columns}
          numColumns={columns}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={s.list}
          columnWrapperStyle={{ gap: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor="#d7fa70"
            />
          }
          ListHeaderComponent={
            <View>
              {source === "demo" && (
                <Text style={s.demo}>
                  MODO DEMOSTRACIÓN · Películas ficticias
                </Text>
              )}
              {!loading && !error && featured && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={"Ver " + featured.titulo}
                  onPress={() => void open(featured)}
                  style={s.hero}
                >
                  <View style={s.heroCopy}>
                    <Text style={s.eyebrow}>EN EL FOCO / ESTRENO</Text>
                    <Text style={s.heroTitle}>{featured.titulo}</Text>
                    <Text style={s.description}>
                      Hay historias que te llevan más lejos. Encuentra la tuya.
                    </Text>
                    <Text style={s.meta}>
                      {featured.categoria} · {featured.duracion} min
                    </Text>
                    <View style={s.heroButton}>
                      <Text style={s.buttonText}>Explorar película ↗</Text>
                    </View>
                  </View>
                  <View
                    style={[s.heroArt, { backgroundColor: featured.color }]}
                  >
                    <View style={s.heroPlanet} />
                    <Text style={s.heroNumber}>01</Text>
                  </View>
                </Pressable>
              )}
              <View style={s.section}>
                <Text style={s.heading}>En cartelera</Text>
                <Text style={s.muted}>{filtered.length} películas</Text>
              </View>
              <TextInput
                accessibilityLabel="Buscar películas por título"
                placeholder="Buscar una película…"
                placeholderTextColor="#88909d"
                value={query}
                onChangeText={setQuery}
                style={s.search}
                autoCorrect={false}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filters}
              >
                {[{ id: null, nombre: "Todas" }, ...categories].map((c) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: category === c.id }}
                    key={String(c.id)}
                    onPress={() => setCategory(c.id)}
                    style={[s.chip, category === c.id && s.chipActive]}
                  >
                    <Text
                      style={[
                        s.chipText,
                        category === c.id && s.chipTextActive,
                      ]}
                    >
                      {c.nombre}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {loading && (
                <ActivityIndicator
                  size="large"
                  color="#d7fa70"
                  style={{ margin: 30 }}
                />
              )}
              {!!error && (
                <View style={s.message}>
                  <Text style={s.messageTitle}>
                    La cartelera no está disponible
                  </Text>
                  <Text style={s.description}>{error}</Text>
                  {button("Reintentar", () => void load())}
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={"Ver detalle de " + item.titulo}
              onPress={() => void open(item)}
              style={s.card}
            >
              <Poster movie={item} />
              <View style={s.cardInfo}>
                {item.estreno && <Text style={s.newLabel}>ESTRENO</Text>}
                <Text style={s.cardTitle}>{item.titulo}</Text>
                <Text style={s.muted}>
                  {item.categoria} · {item.duracion} min
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={s.message}>
                <Text style={s.messageTitle}>No encontramos películas</Text>
                <Text style={s.description}>
                  Prueba otro título o selecciona otra categoría.
                </Text>
                {button("Limpiar filtros", () => {
                  setQuery("");
                  setCategory(null);
                })}
              </View>
            ) : null
          }
          ListFooterComponent={
            <View style={s.footer}>
              <Text style={s.cardTitle}>Una buena historia te espera.</Text>
              <Text style={s.muted}>
                CineApp · Catálogo de cine · Práctica U2
              </Text>
            </View>
          }
        />
        <Modal
          visible={selected !== null}
          animationType="slide"
          onRequestClose={() => setSelected(null)}
        >
          <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={s.detail}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelected(null)}
                style={s.back}
              >
                <Text style={s.backText}>← Volver a cartelera</Text>
              </Pressable>
              {selected && (
                <>
                  <Poster movie={selected} large />
                  <Text style={s.eyebrow}>LA PELÍCULA</Text>
                  <Text style={s.heroTitle}>{selected.titulo}</Text>
                  <Text style={s.detailMeta}>
                    {selected.categoria} · {selected.duracion} minutos
                  </Text>
                  <Text style={s.label}>DIRECCIÓN</Text>
                  <Text style={s.director}>{selected.director}</Text>
                  <Text style={s.label}>SINOPSIS</Text>
                  <Text style={s.synopsis}>{selected.sinopsis}</Text>
                  {detailLoading && <ActivityIndicator color="#d7fa70" />}
                  {!!detailError && (
                    <Text accessibilityRole="alert" style={s.description}>
                      {detailError}
                    </Text>
                  )}
                  <Text style={[s.muted, { marginTop: 30 }]}>
                    Consulta de cartelera. Las reservas y la venta de boletos no
                    forman parte de esta aplicación.
                  </Text>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#101216", paddingTop: 0 },
  container: { flex: 1, width: "100%", maxWidth: 1180, alignSelf: "center" },
  header: {
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1.5,
  },
  tagline: { color: "#9298a3", fontSize: 8, letterSpacing: 1.4, marginTop: 6 },
  badge: {
    borderWidth: 1,
    borderColor: "#343a42",
    borderRadius: 30,
    padding: 10,
    fontSize: 9,
    letterSpacing: 1.4,
    color: "#eee",
  },
  list: { paddingHorizontal: 24 },
  demo: { color: "#d7fa70", fontSize: 10, letterSpacing: 1, marginBottom: 16 },
  hero: {
    backgroundColor: "#20252e",
    borderRadius: 22,
    overflow: "hidden",
    flexDirection: "row",
    minHeight: 250,
    marginBottom: 30,
  },
  heroCopy: { flex: 1, padding: 24 },
  eyebrow: {
    color: "#d7fa70",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  description: {
    fontSize: 14,
    color: "#c1c6d0",
    lineHeight: 22,
    marginTop: 12,
  },
  meta: { fontSize: 11, color: "#c1c6d0", marginTop: 18 },
  heroButton: {
    backgroundColor: "#d7fa70",
    borderRadius: 10,
    alignSelf: "flex-start",
    padding: 12,
    marginTop: 20,
  },
  heroArt: {
    width: "28%",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  heroPlanet: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#b2a4ff",
    borderWidth: 18,
    borderColor: "#8977ee",
  },
  heroNumber: {
    position: "absolute",
    bottom: 16,
    right: 12,
    color: "#ffffff55",
    fontSize: 60,
    fontWeight: "900",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  heading: { fontSize: 26, color: "#fff", fontWeight: "700" },
  muted: { color: "#a2a9b6", fontSize: 12, lineHeight: 19 },
  search: {
    backgroundColor: "#1c2027",
    borderWidth: 1,
    borderColor: "#333943",
    borderRadius: 12,
    padding: 15,
    color: "#fff",
    fontSize: 14,
  },
  filters: { gap: 8, paddingVertical: 18, paddingBottom: 24 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#20242c",
  },
  chipActive: { backgroundColor: "#d7fa70" },
  chipText: { color: "#aeb5c1", fontSize: 12 },
  chipTextActive: { color: "#19200b", fontWeight: "700" },
  card: { flex: 1, marginBottom: 24 },
  poster: {
    height: 230,
    borderRadius: 14,
    overflow: "hidden",
    padding: 16,
    justifyContent: "space-between",
  },
  orbit: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "#ffffff55",
    top: -35,
    right: -85,
  },
  planet: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 80,
    backgroundColor: "#ffffff18",
    top: 15,
    right: -55,
  },
  mark: {
    color: "#ffffffbb",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },
  caption: {
    color: "#ffffffbb",
    fontSize: 7,
    letterSpacing: 1,
    marginBottom: 9,
  },
  posterTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  credit: { color: "#ffffffcc", fontSize: 10, marginTop: 12 },
  cardInfo: { paddingTop: 12, gap: 5 },
  newLabel: {
    color: "#d7fa70",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  cardTitle: { color: "#f3f4f6", fontWeight: "700", fontSize: 15 },
  footer: {
    paddingVertical: 28,
    borderTopWidth: 1,
    borderColor: "#2b3038",
    marginTop: 8,
    gap: 8,
  },
  message: { paddingVertical: 30, gap: 14 },
  messageTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#d7fa70",
    padding: 14,
    borderRadius: 10,
  },
  buttonText: { color: "#182008", fontWeight: "800", fontSize: 12 },
  detail: { padding: 24, maxWidth: 650, width: "100%", alignSelf: "center" },
  back: { paddingVertical: 18, marginBottom: 8 },
  backText: { color: "#d7fa70", fontSize: 14 },
  detailMeta: { color: "#c0c6d0", marginTop: 12, fontSize: 15 },
  label: {
    color: "#9ba4b4",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 30,
    marginBottom: 10,
  },
  director: { color: "#fff", fontSize: 18 },
  synopsis: { color: "#d0d6e0", fontSize: 17, lineHeight: 28 },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <CineApp />
    </SafeAreaProvider>
  );
}
