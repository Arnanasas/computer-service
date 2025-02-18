import ReactDOM from "react-dom";
import { formatCurrencyInWords } from "../assets/helpers";
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
    fontSize: 12,
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

const PaymentActDocument = ({
  price,
  paymentMethod,
  paymentId,
  clientType,
  paidDate,
  companyName,
  companyCode,
  pvmCode,
  address,
  service,
  clientName,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[styles.flex, styles.justifyBetween]}>
        <View style={styles.marginBottom2}>
          <Image src={require("../assets/img/logo.png")} style={styles.logo} />
        </View>

        <View style={[styles.marginBottom1]}>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.fontBold, styles.fontLarge]}>
              PVM sąskaita faktūra
            </Text>
            <Text style={[styles.fontLarge, styles.fontThin]}>
              Serija {paymentMethod === "kortele" ? "CRD" : "GRN"}-{paymentId}
            </Text>
            <Text style={styles.fontThin}>{paidDate.substring(0, 10)}</Text>
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

        <View style={styles.w50}>
          <Text style={[styles.fontBold, styles.marginBottom1]}>Pirkėjas:</Text>
          <Text style={styles.fontBold}>
            {clientType === "privatus"
              ? clientName || "Privatus klientas"
              : companyName}
          </Text>
          {clientType !== "privatus" && (
            <>
              <Text>Įmonės kodas: {companyCode}</Text>
              <Text>PVM kodas: {pvmCode}</Text>
              <Text>Adresas: {address}</Text>
            </>
          )}
        </View>
      </View>

      {/* <View style={styles.marginBottom1}>
        <Text style={styles.fontBold}>PVM SĄSKAITA - FAKTŪRA</Text>
        <Text>
          Serija {paymentMethod === "kortele" ? "CRD" : "GRN"}-{paymentId}
        </Text>
        <Text>{paidDate.substring(0, 10)}</Text>
      </View> */}

      <Text style={styles.fontBold}>Atsiskaityti už:</Text>

      <View style={styles.section}>
        <View style={{ marginBottom: 10 }}>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 0.5,
              borderColor: "#000",
              paddingVertical: 5,
            }}
          >
            <Text style={{ flex: 2, fontWeight: "bold", textAlign: "left" }}>
              Pavadinimas
            </Text>
            <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>
              Kiekis
            </Text>
            <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>
              Kaina
            </Text>
            <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>
              Suma
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              paddingVertical: 5,
              borderBottomWidth: 0.5,
            }}
          >
            <Text style={{ flex: 2, textAlign: "left" }}>{service}</Text>
            <Text style={{ flex: 1, textAlign: "center" }}>1</Text>
            <Text style={{ flex: 1, textAlign: "center" }}>
              {(price / 1.21).toFixed(2)} €
            </Text>
            <Text style={{ flex: 1, textAlign: "center" }}>
              {(price / 1.21).toFixed(2)} €
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.flex,
          { justifyContent: "flex-end", flexDirection: "column" },
        ]}
      >
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
            <Text style={[styles.cell, { textAlign: "right" }]}>Suma:</Text>
            <Text style={[styles.cell, { textAlign: "right" }]}>PVM 21%:</Text>
            <Text
              style={[styles.cell, styles.fontBold, { textAlign: "right" }]}
            >
              IŠ VISO:
            </Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
            <Text style={[styles.cell, { textAlign: "right" }]}>
              {(price / 1.21).toFixed(2)} EUR
            </Text>
            <Text style={[styles.cell, { textAlign: "right" }]}>
              {(price - (price / 1.21).toFixed(2)).toFixed(2)} EUR
            </Text>
            <Text
              style={[styles.cell, styles.fontBold, { textAlign: "right" }]}
            >
              {(price * 1).toFixed(2)} EUR
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.marginBottom1}>
        Suma žodžiais: {formatCurrencyInWords(price)}
      </Text>

      <Text style={styles.marginBottom4}>
        Sumokėta {paymentMethod === "kortele" ? "kortele" : "grynais"}.
      </Text>

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

export default PaymentActDocument;
