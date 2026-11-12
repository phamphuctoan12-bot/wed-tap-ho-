import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public class ImageGenerator {
    public static void main(String[] args) {
        File dir = new File("public/images");
        if (!dir.exists()) dir.mkdirs();

        Map<String, String[]> items = new LinkedHashMap<>();
        // key: filename -> [title, subtitle, badge, color1, color2, icon, unit]
        items.put("sp1_haohao.svg", new String[]{"HAO HAO", "TOM CHUA CAY", "VI QUOC DAN", "#ff4d4f", "#cf1322", "Tom Chua Cay", "Goi 75g"});
        items.put("sp2_omachi.svg", new String[]{"OMACHI", "SUON HAM NGU QUA", "MI KHOAI TAY", "#871400", "#5c0011", "Suon Ham", "Goi 80g"});
        items.put("sp3_phodenhat.svg", new String[]{"DE NHAT", "PHO BO DAC BIET", "NUOC COT THIT BO", "#389e0d", "#135200", "Pho Bo", "Goi 68g"});
        items.put("sp4_gaost25.svg", new String[]{"GAO ONG CUA", "ST25 DAC SAN", "GAO NGON THE GIOI", "#d48806", "#ad6800", "Deo Thom", "Tui 5Kg"});
        items.put("sp5_cocacola.svg", new String[]{"COCA-COLA", "VI NGUYEN BAN", "GIAI KHAT SANG KHOAI", "#f5222d", "#a8071a", "Original", "Lon 320ml"});
        items.put("sp6_sting.svg", new String[]{"STING", "DAU TAY DO", "ENERGY DRINK", "#cf1322", "#820014", "Dau Tay", "Chai 330ml"});
        items.put("sp7_vinamilk.svg", new String[]{"VINAMILK", "100% SUA TUOI", "TIET TRUNG BO DUONG", "#1890ff", "#003a8c", "Co Duong", "Hop 1 Lit"});
        items.put("sp8_lavie.svg", new String[]{"LAVIE", "KHOANG THIEN NHIEN", "TINH KHIET MOI NGAY", "#096dd9", "#003a8c", "Natural", "Chai 500ml"});
        items.put("sp9_simply.svg", new String[]{"SIMPLY", "DAU DAU NANH", "TRAI TIM KHOE", "#faad14", "#d48806", "100% Pure", "Chai 1 Lit"});
        items.put("sp10_namngu.svg", new String[]{"NAM NGU", "NUOC MAM DE NHI", "CA COM DAM DA", "#d4380d", "#871400", "Ca Com", "Chai 900ml"});
        items.put("sp11_knorr.svg", new String[]{"KNORR", "HAT NEM THIT THAN", "XUONG ONG HAM", "#52c41a", "#237804", "Dam Vi", "Goi 400g"});
        items.put("sp12_tamthaitu.svg", new String[]{"TAM THAI TU", "NUOC TUONG NHAT CA", "DAU NANH THANH NGOT", "#262626", "#000000", "Nhat Ca", "Chai 500ml"});
        items.put("sp13_chocopie.svg", new String[]{"CHOCOPIE", "ORION MARSHMALLOW", "SOCOLA KEP KEM DEO", "#a8071a", "#5c0011", "Orion", "Hop 12 Cai"});
        items.put("sp14_cosy.svg", new String[]{"COSY", "BANH QUY BO SUA", "KINH DO THOM NGAY", "#d48806", "#874d00", "Gion Rum", "Hop 288g"});
        items.put("sp15_ostar.svg", new String[]{"O STAR", "SNACK KHOAI TAY", "VI TAO BIEN THOM", "#08979c", "#00474f", "100% Khoai", "Goi 90g"});
        items.put("sp16_omo.svg", new String[]{"OMO MATIC", "XOAY BAY VET BAN", "HUONG HOA TUOI MAT", "#eb2f96", "#9e1068", "Cua Tren", "Tui 3.6Kg"});
        items.put("sp17_sunlight_chanh.svg", new String[]{"SUNLIGHT", "NUOC RUA CHEN CHANH", "DANH BAY DAU MO", "#a0d911", "#5b8c00", "Chanh Tuoi", "Chai 750g"});
        items.put("sp18_sunlight_lau_san.svg", new String[]{"SUNLIGHT", "NUOC LAU SAN NHA", "SACH BONG HUONG HOA", "#722ed1", "#391085", "Hoa Ha", "Chai 1Kg"});

        for (Map.Entry<String, String[]> entry : items.entrySet()) {
            String filename = entry.getKey();
            String[] v = entry.getValue();
            String svg = generateSvg(v[0], v[1], v[2], v[3], v[4], v[5], v[6]);
            try (OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(new File(dir, filename)), StandardCharsets.UTF_8)) {
                writer.write(svg);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        System.out.println("DA TAO THANH CONG TOAN BO 18 ANH SAN PHAM SVG!");
    }

    private static String generateSvg(String title, String subtitle, String badge, String c1, String c2, String tag, String unit) {
        return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 300\" width=\"100%\" height=\"100%\">\n" +
               "  <defs>\n" +
               "    <linearGradient id=\"grad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n" +
               "      <stop offset=\"0%\" stop-color=\"" + c1 + "\"/>\n" +
               "      <stop offset=\"100%\" stop-color=\"" + c2 + "\"/>\n" +
               "    </linearGradient>\n" +
               "  </defs>\n" +
               "  <rect width=\"100%\" height=\"100%\" fill=\"#f8f9fa\"/>\n" +
               "  <rect x=\"35\" y=\"25\" width=\"330\" height=\"250\" rx=\"20\" fill=\"url(#grad)\" stroke=\"#ffffff\" stroke-width=\"4\"/>\n" +
               "  <circle cx=\"200\" cy=\"135\" r=\"68\" fill=\"#ffffff\" opacity=\"0.95\"/>\n" +
               "  <text x=\"200\" y=\"115\" font-family=\"Impact, Arial, sans-serif\" font-size=\"30\" fill=\"" + c2 + "\" text-anchor=\"middle\">" + title + "</text>\n" +
               "  <text x=\"200\" y=\"145\" font-family=\"Arial, sans-serif\" font-weight=\"bold\" font-size=\"14\" fill=\"#333333\" text-anchor=\"middle\">" + subtitle + "</text>\n" +
               "  <rect x=\"130\" y=\"160\" width=\"140\" height=\"24\" rx=\"12\" fill=\"" + c1 + "\"/>\n" +
               "  <text x=\"200\" y=\"177\" font-family=\"Arial, sans-serif\" font-weight=\"bold\" font-size=\"12\" fill=\"#ffffff\" text-anchor=\"middle\">" + tag + " - " + unit + "</text>\n" +
               "  <rect x=\"70\" y=\"225\" width=\"260\" height=\"30\" rx=\"15\" fill=\"#ffffff\" opacity=\"0.9\"/>\n" +
               "  <text x=\"200\" y=\"246\" font-family=\"Arial, sans-serif\" font-weight=\"bold\" font-size=\"13\" fill=\"" + c2 + "\" text-anchor=\"middle\">" + badge + "</text>\n" +
               "</svg>";
    }
}
