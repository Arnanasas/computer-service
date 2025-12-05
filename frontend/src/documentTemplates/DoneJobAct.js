import {
  Document,
  Page,
  Image,
  Text,
  View,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

// Font.register({
//   family: "Gabarito",
//   src: require("../assets/fonts/gabarito/Gabarito-Regular.ttf"),
// });

// Font.register({
//   family: "Gabarito-Medium",
//   src: require("../assets/fonts/gabarito/Gabarito-Medium.ttf"),
// });

Font.register({
  family: "Inter",
  src: require("../assets/fonts/inter/Inter_24pt-Regular.ttf"),
});

Font.register({
  family: "Inter-Bold",
  src: require("../assets/fonts/inter/Inter_24pt-Bold.ttf"),
});

Font.register({
  family: "Inter-Thin",
  src: require("../assets/fonts/inter/Inter_24pt-Light.ttf"),
});

// Create styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingHorizontal: 25,
    fontFamily: "Inter",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  fontBold: {
    fontFamily: "Inter-Bold",
    letterSpacing: 0.5,
  },
  fontThin: {
    fontFamily: "Inter-Thin",
    letterSpacing: 0.5,
  },
  textCenter: {
    textAlign: "center",
  },
  logo: {
    width: "100px",
  },
  marginBottom1: {
    marginBottom: 10,
  },
  marginBottom2: {
    marginBottom: 25,
  },
  marginBottom4: {
    marginBottom: 70,
  },
  marginLeft4: {
    marginLeft: 120,
  },
  w50: {
    width: "50%",
  },
  flex: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  horizontalLine: {
    backgroundColor: "black",
    width: "100%",
    height: 1,
  },
  section: {
    marginVertical: 10,
  },
  relative: {
    position: "relative",
  },
  absoluteHorizontalCenter: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColName: {
    width: "40%",
  },
  cell: {
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 10,
  },
  signaturePlaceholder: {
    textAlign: "center",
    borderTop: "1px solid black",
    width: 130,
    marginHorizontal: 15,
  },
  textLeft: {
    textAlign: "left",
  },
  textRight: {
    textAlign: "right",
  },
  fontLarge: {
    fontSize: 16,
  },
});

const DoneJobActDocument = ({
  serviceId,
  paidDate,
  works = [],
  usedParts = [],
  failure = "",
}) => {
  const paidDateText = (paidDate || "").toString().substring(0, 10);

  const rows = [
    ...((Array.isArray(works) ? works : []).map((w) => ({
      type: "Darbas",
      name: w.name || "",
      description: w.description || "",
    })) || []),
    ...((Array.isArray(usedParts) ? usedParts : []).map((p) => ({
      type: "Prekė",
      name: p.category || "",
      description: p.name || "",
    })) || []),
  ];

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[styles.flex, styles.justifyBetween]}>
        <View style={styles.marginBottom2}>
          <Image src={require("../assets/img/logo.png")} style={styles.logo} />
        </View>

        <View style={[styles.marginBottom1]}>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.fontBold, styles.fontLarge]}>
              Atliktų darbų aktas
            </Text>
            <Text style={[styles.fontLarge, styles.fontThin]}>
              Remonto numeris - {serviceId}
            </Text>
            <Text style={styles.fontThin}>{paidDateText}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.flex, styles.justifyBetween, styles.marginBottom4]}>
        <View style={styles.w50}>
          <View style={styles.marginBottom1}>
            <Text style={[styles.fontBold, styles.marginBottom1]}>
              Tiekėjas:
            </Text>
            <Text style={styles.fontBold}>IT112, MB</Text>
            <Text>Įm. k. 306561580</Text>
            <Text>PVM kodas: LT100016378016</Text>
            <Text>Adresas: Kalvarijų g. 2, Vilnius</Text>
          </View>

          <View>
            <Text style={[styles.fontBold, styles.marginBottom1]}>
              Įmonės sąskaita:
            </Text>
            <Text>AB Swedbank,</Text>
            <Text>LT077300010181630587</Text>
          </View>
        </View>

      </View>

      {/* Client complaint (unstyled) */}
      <View style={styles.section}>
        <Text style={styles.fontBold}>Kliento nusiskundimas</Text>
        <Text style={{ marginTop: 4 }}>{failure}</Text>
      </View>

      <Text style={styles.fontBold}>Atlikti darbai:</Text>

      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={[styles.cell, styles.fontBold]}>Prekė</Text>
            </View>
            <View style={[styles.tableCol, styles.tableColName]}>
              <Text style={[styles.cell, styles.fontBold]}>Pavadinimas</Text>
            </View>
            <View style={[styles.tableCol, styles.tableColName]}>
              <Text style={[styles.cell, styles.fontBold]}>Aprašymas</Text>
            </View>
          </View>
          {(rows.length > 0 ? rows : [{ type: "-", name: "-", description: "" }]).map((item, idx) => (
            <View style={styles.tableRow} key={`row-${idx}`}>
              <View style={styles.tableCol}>
                <Text style={styles.cell}>{item.type}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColName]}>
                <Text style={styles.cell}>{item.name}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColName]}>
                <Text style={styles.cell}>{item.description || ""}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 12 }} />

      {/* Completion status */}
      <Text style={[styles.textCenter, styles.fontBold]}>Remonto užbaigimo statusas išvada: Įrenginys grąžintas suremontuotas</Text>
      <Text style={[styles.textCenter, { fontSize: 8, marginTop: 6 }]}>Darbams ir pakeistoms detalėms įrenginiams suteikiame 90 dienų. garantiją nuo įrenginio atsiėmimo. Sudrėkusių bei struktūriškai pažeistų įrenginių taisymui garantija neteikiama.</Text>

      <View style={styles.marginBottom4} />

      <View style={[styles.flex, styles.justifyBetween]}>
        <View style={styles.signaturePlaceholder}>
          <Text style={[styles.marginBottom2, { paddingTop: 8 }]}>
            Darbuotojo parašas
          </Text>
        </View>

        <View style={styles.signaturePlaceholder}>
          <Text style={[styles.marginBottom2, { paddingTop: 8 }]}>
            Užsakovo parašas
          </Text>
        </View>
      </View>
    </Page>
  </Document>
  );
};

export default DoneJobActDocument;
