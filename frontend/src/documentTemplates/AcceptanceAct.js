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
  },
  marginBottom1: {
    marginBottom: 10,
  },
  marginBottom2: {
    marginBottom: 25,
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
    width: "100%",
    height: 0,
    borderBottom: "2px dashed gray",
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
    width: "50%",
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  cell: {
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 12,
  },
});

const AcceptanceActBlock = ({
  repairNumber,
  name,
  phoneNumber,
  failure,
  hasCharger,
}) => (
  <View>
    <View style={[styles.section]}>
      <Image src={require("../assets/img/logo.png")} style={styles.logo} />
    </View>

    <View style={styles.section}>
      <View style={styles.table}>
        {/* Row 1 */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.cell}>Vardas Pavardė</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={[styles.cell, styles.textCenter]}>{name}</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.cell}>Telefono numeris</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={[styles.cell, styles.textCenter]}>{phoneNumber}</Text>
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.cell}>Pakrovėjas</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={[styles.cell, styles.textCenter]}>
              {hasCharger ? "Taip" : "Ne"}
            </Text>
          </View>
        </View>

        {/* Row 4 */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.cell}>Gedimas</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={[styles.cell, styles.textCenter]}>{failure}</Text>
          </View>
        </View>

        {/* Row 5 */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.cell}>Remonto numeris</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={[styles.cell, styles.textCenter]}>{repairNumber}</Text>
          </View>
        </View>
      </View>
    </View>

    <View style={[styles.section, styles.marginBottom2]}>
      <Text>
        Užsakovas parašu žemiau patvirtina, kad sutinka su remonto sąlygomis ir
        kad visa programinė įranga kietajame diske ar kitose duomenų laikmenose
        priklauso jam. Todėl už programinės įrangos legalumą atsako užsakovas.
        <Text style={styles.fontBold}> MB „IT112“</Text> neatsako už jokių
        duomenų pateiktoje įrangoje išsaugojimą, išskyrus nurodytus atvejus
        šiame akte. Užsakovui patvirtinus įrangos remonto darbus ir vėliau
        atsisakius tęsti remontą, turi kompensuoti sunaudoto laiko bei detalių
        kaštus. Sutaisyta ar nesutaisyta įranga saugoma ne ilgiau kaip vieną
        mėnesį. Neatsiėmus įrangos laiku, įrenginio tolimesniam saugojimui
        taikomas 1 eur per dieną mokestis. Tokiu atveju įrenginys grąžinamas
        klientui tik sumokėjus saugojimo mokestį.
      </Text>
    </View>

    <View style={[styles.marginBottom2]}>
      <Text style={[styles.fontBold, styles.marginBottom1]}>
        Užsakovo parašas:
      </Text>
      <Text style={[styles.fontBold]}>Darbuotojo parašas:</Text>
    </View>

    <View
      style={[
        styles.relative,
        styles.flex,
        styles.justifyBetween,
        styles.marginBottom1,
      ]}
    >
      <Text style={styles.fontBold}>Kalvarijų g. 2, Vilnius</Text>
      <Text style={[styles.absoluteHorizontalCenter, styles.fontBold]}>
        +370 658 04435
      </Text>
      <Text style={styles.fontBold}>www.it112.lt</Text>
    </View>
  </View>
);

const AcceptanceActDocument = ({
  repairNumber,
  name,
  phoneNumber,
  failure,
  hasCharger,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <AcceptanceActBlock
        repairNumber={repairNumber}
        name={name}
        phoneNumber={phoneNumber}
        failure={failure}
        hasCharger={hasCharger}
      />
      <View style={styles.horizontalLine}></View>
      <AcceptanceActBlock
        repairNumber={repairNumber}
        name={name}
        phoneNumber={phoneNumber}
        failure={failure}
        hasCharger={hasCharger}
      />
    </Page>
  </Document>
);

export default AcceptanceActDocument;
