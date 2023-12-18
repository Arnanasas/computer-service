import ReactDOM from "react-dom";
import {
  Document,
  Page,
  Image,
  Text,
  View,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

Font.register({
  family: "Gabarito",
  src: require("../assets/fonts/gabarito/Gabarito-Regular.ttf"),
});

Font.register({
  family: "Gabarito-Medium",
  src: require("../assets/fonts/gabarito/Gabarito-Medium.ttf"),
});

// Create styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingHorizontal: 25,
    fontFamily: "Gabarito",
    fontSize: 11,
  },
  fontBold: {
    fontFamily: "Gabarito-Medium",
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
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.marginBottom2}>
        <Image src={require("../assets/img/logo.png")} style={styles.logo} />
      </View>

      <View style={[styles.flex, styles.justifyBetween, styles.marginBottom4]}>
        <View style={styles.w50}>
          <View style={styles.marginBottom1}>
            <Text style={styles.fontBold}>Paslaugos tiekėjas:</Text>
            <Text>MB „IT112“</Text>
            <Text>Įm. k. 306561580</Text>
            <Text>PVM kodas: LT100016378016</Text>
            <Text>Adresas: Kalvarijų g. 2, Vilnius</Text>
          </View>

          <View>
            <Text style={styles.fontBold}>Įmonės sąskaita:</Text>
            <Text>AB Swedbank,</Text>
            <Text>LT077300010181630587</Text>
          </View>
        </View>

        <View style={styles.w50}>
          <Text style={styles.fontBold}>Paslaugos pirkėjas:</Text>
          <Text>
            {clientType === "privatus" ? "Privatus klientas" : companyName}
          </Text>
          <Text>
            Įmonės/asmens kodas: {clientType !== "privatus" ? companyCode : ""}
          </Text>
          <Text>PVM kodas: {clientType !== "privatus" ? pvmCode : ""}</Text>
          <Text>Adresas: {clientType !== "privatus" ? address : ""}</Text>
        </View>
      </View>

      <View style={styles.marginBottom1}>
        <Text style={styles.fontBold}>PVM SĄSKAITA - FAKTŪRA</Text>
        <Text>
          Serija {paymentMethod === "kortele" ? "CRD" : "GRN"}-{paymentId}
        </Text>
        <Text>{paidDate.substring(0, 10)}</Text>
      </View>

      <Text style={styles.fontBold}>Atsiskaityti už:</Text>

      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.tableColName]}>
              <Text style={styles.cell}>{service}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cell}>
                Kaina: {(price / 1.21).toFixed(2)} €
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cell}>
                PVM 21%: {(price - (price / 1.21).toFixed(2)).toFixed(2)} €
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cell}>Viso: {price} €</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.marginBottom4}>
        Sumokėta {paymentMethod === "kortele" ? "kortele" : "grynais"}.
      </Text>

      <View style={[styles.flex, styles.justifyBetween]}>
        <View style={styles.signaturePlaceholder}>
          <Text style={styles.marginBottom2}>Darbuotojo parašas</Text>
        </View>

        <View style={styles.signaturePlaceholder}>
          <Text style={styles.marginBottom2}>Užsakovo parašas</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default PaymentActDocument;
