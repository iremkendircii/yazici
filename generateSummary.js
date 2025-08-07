const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'json_outputs');
const outputFile = path.join(__dirname, 'summary.csv');

let output = 'Birim,IP,Siyah Kartuş %,Mavi Kartuş %,Kırmızı Kartuş %,Sarı Kartuş %,Siyah Fotokondüktör %,Mavi Fotokondüktör %,Kırmızı Fotokondüktör %,Sarı Fotokondüktör %,Isıtıcı Kiti %,Bakım Kiti %,Seri Numarası\n';
let toplamYazici = 0;

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(inputDir, file);
    const ip = file.replace('.json', '').replace(/_/g, '.');

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const supplies = data?.nodes?.supplies;
        if (!supplies) {
            console.warn(`⚠️  ${file}: supplies bilgisi bulunamadı.`);
            continue;
        }

        let printerData = {
            ip: ip,
            black: '',
            cyan: '',
            magenta: '',
            yellow: '',
            blackPhotoconductor: '',
            cyanPhotoconductor: '',
            magentaPhotoconductor: '',
            yellowPhotoconductor: '',
            fuserKit: '',
            maintenanceKit: '',
            serial: ''
        };

        for (const key in supplies) {
            const item = supplies[key];
            const color = item?.color || item?.supplyName || key;
            const percent = item?.percentFull;
            const serialNumber = item?.serialNumber?.trim() || 'Bilinmiyor';


            //emekten selamlar
             // Siyah kartuş için özel olarak "Black Toner" anahtarını ara
        if (supplies['Black Toner']) {
            const blackObj = supplies['Black Toner'];
            printerData.black = 
                blackObj.percentFull !== undefined ? blackObj.percentFull :
                (blackObj.curlevel !== undefined ? blackObj.curlevel : '');
            printerData.serial = blackObj.serialNumber?.trim() || 'Bilinmiyor';
        }
         
            if (color && percent !== undefined) {
                
                if (color.toLowerCase().includes('cyan')) {
                    printerData.cyan = percent;
                } else if (color.toLowerCase().includes('magenta')) {
                    printerData.magenta = percent;
                } else if (color.toLowerCase().includes('yellow')) {
                    printerData.yellow = percent;
                }
            }

            // Fotokondüktör bilgilerini çıkar
            if (key === 'Black Photoconductor') {
                printerData.blackPhotoconductor = 
                    item.percentFull !== undefined ? item.percentFull :
                    (item.curlevel !== undefined ? item.curlevel : '');
            } else if (key === 'Cyan Photoconductor') {
                printerData.cyanPhotoconductor = 
                    item.percentFull !== undefined ? item.percentFull :
                    (item.curlevel !== undefined ? item.curlevel : '');
            } else if (key === 'Magenta Photoconductor') {
                printerData.magentaPhotoconductor = 
                    item.percentFull !== undefined ? item.percentFull :
                    (item.curlevel !== undefined ? item.curlevel : '');
            } else if (key === 'Yellow Photoconductor') {
                printerData.yellowPhotoconductor = 
                    item.percentFull !== undefined ? item.percentFull :
                    (item.curlevel !== undefined ? item.curlevel : '');
            }

            // Kit bilgilerini çıkar
            if (key === 'Fuser Kit') {
                printerData.fuserKit = 
                    item.percentFull !== undefined ? item.percentFull :
                    (item.curlevel !== undefined ? item.curlevel : '');
            } else if (key === 'Maintenance Kit' || key === '200K HCF Maintenance Kit' || key === '200K MPF Maintenance Kit' || key === '300K Maintenance Kit') {
                printerData.maintenanceKit = 
                    item.percentFull !== undefined ? item.percentFull :
                    (item.curlevel !== undefined ? item.curlevel : '');
            }
        }

        // Birim bilgisini IP'den çıkar (örneğin 10.30.42.xx -> Başkan Yardımcılığı)
        let birim = '';
        if (ip.startsWith('10.30.42')) {
            birim = 'Başkan Yardımcılığı';
        } else if (ip.startsWith('10.30.70')) {
            birim = 'Genel Sekreterlik';
        } else if (ip.startsWith('192.168')) {
            birim = 'Diğer Birimler';
        }

        output += `${birim},${printerData.ip},${printerData.black},${printerData.cyan},${printerData.magenta},${printerData.yellow},${printerData.blackPhotoconductor},${printerData.cyanPhotoconductor},${printerData.magentaPhotoconductor},${printerData.yellowPhotoconductor},${printerData.fuserKit},${printerData.maintenanceKit},${printerData.serial}\n`;
        toplamYazici++;

    } catch (err) {
        console.warn(`❌ ${file} okunamadı: ${err.message}`);
    }
}

fs.writeFileSync(outputFile, output, 'utf8');
console.log(`✔ summary.csv oluşturuldu!`);
console.log(`📊 Toplam yazıcı: ${toplamYazici}`);