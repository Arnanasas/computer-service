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
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
});

Font.register({
  family: "Roboto-Medium",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
});

// Create styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingHorizontal: 25,
    fontFamily: "Roboto",
    fontSize: 11,
  },
  fontBold: {
    fontFamily: "Roboto-Medium",
  },
  textCenter: {
    textAlign: "center",
  },
  logo: {
    width: "40px",
    position: "absolute",
    right: 0,
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
});

const PaymentActDocument = ({
  price,
  paymentMethod,
  paymentId,
  clientType,
  paidDate,
  companyCode,
  pvmCode,
  address,
  email,
  failure,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[styles.relative, styles.section, styles.marginBottom2]}>
        <Image src={require("../assets/img/logo.png")} style={styles.logo} />

        <Text style={styles.fontBold}>Paslaugos tiekėjas:</Text>
        <Text style={styles.fontBold}>Kompiuterių taisykla PELĖ</Text>
        <Text>MB „IT112“, įm. k. 306561580</Text>
        <Text>Reg. adresas: Kalvarijų g. 2, Vilnius</Text>
        <Text>Adresas: Kalvarijų g. 2, Vilnius</Text>
        <Text>PVM kodas: LT100016378016</Text>
      </View>

      <View style={styles.marginBottom2}>
        <Text style={styles.fontBold}>SĄSKAITA APMOKĖJIMUI:</Text>
        <Text>AB Swedbank: LT077300010181630587</Text>
      </View>

      <View style={styles.marginBottom4}>
        <Text style={styles.fontBold}>Paslaugos pirkėjas:</Text>
        <Text>
          {clientType === "privatus" ? "Privatus klientas" : "Juridinis asmuo"}
        </Text>
        <Text>
          Įmonės/asmens kodas: {clientType !== "privatus" ? companyCode : ""}
        </Text>
        <Text>PVM kodas: {clientType !== "privatus" ? pvmCode : ""}</Text>
        <Text>Adresas: {clientType !== "privatus" ? address : ""}</Text>
        <Text>El. Paštas: {clientType !== "privatus" ? email : ""}</Text>
      </View>

      <View style={styles.marginBottom1}>
        <Text style={styles.fontBold}>PVM SĄSKAITA - FAKTŪRA</Text>
        <Text style={styles.fontBold}>
          Serija {paymentMethod === "kortele" ? "CRD" : "GRN"}-{paymentId}
        </Text>
      </View>
      <View>
        <Text>{paidDate}</Text>
        <Text>Sumokėti už:</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.tableColName]}>
              <Text style={styles.cell}>{failure} 1 vnt.</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cell}>
                Kaina: {(price - (price * 0.21).toFixed(2)).toFixed(2)} €
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cell}>
                PVM 21%: {(price * 0.21).toFixed(2)} €
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cell}>Viso: {price} €</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.marginBottom2}>
        Sumokėta {paymentMethod === "kortele" ? "kortele" : "grynais"}.
      </Text>

      <Text style={styles.marginBottom2}>Darbuotojo parašas:</Text>

      <Text style={styles.marginBottom2}>Užsakovo parašas:</Text>
    </Page>
  </Document>
);

export default PaymentActDocument;
