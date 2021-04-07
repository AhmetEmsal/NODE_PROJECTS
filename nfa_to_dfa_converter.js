require('colors');

class NFA {
    constructor(durumlarKumesi, girisAlfabesi, ucDurumlarKumesi, durumGecisleri) {
        //Durumlar Kümesi Girdi Kontrolü
        durumlarKumesi = durumlarKumesi.map(i => i.trim().toUpperCase());
        if (durumlarKumesi.find(i => i == "")) throw new Error('Durumlar kümesinde tespit edilen boş değer(ler) mevcut!');
        if (durumlarKumesi.length < 2) throw new Error('Durumlar kümesi en az 2 elamanlı olmalı!');
        this.durumlarKumesi = durumlarKumesi;

        //Giriş Alfabesi Girdi Kontrolü
        girisAlfabesi = girisAlfabesi.map(i => i.trim());
        if (girisAlfabesi.find(i => i == "")) throw new Error('Giriş alfabesinde tespit edilen boş değer(ler) mevcut!');
        if (girisAlfabesi.length < 2) throw new Error('Giriş alfabesi en az 2 elemanlı olmalı!');
        this.girisAlfabesi = girisAlfabesi;

        //Uç Durumlar Kümesi Girdi Kontrolü
        ucDurumlarKumesi = ucDurumlarKumesi.map(i => i.trim().toUpperCase());
        if (ucDurumlarKumesi.find(i => i == "")) throw new Error('Uç durumlar kümesinde tespit edilen boş değer(ler) mevcut!');
        if (ucDurumlarKumesi.length < 1) throw new Error('Uç durumlar kümesi en az 1 elemanlı olmalı!');
        this.ucDurumlarKumesi = ucDurumlarKumesi;

        //Durum Geçişleri Girdi Kontrolü
        if (typeof durumGecisleri == "string") {
            durumGecisleri = durumGecisleri
                .split('\n').map(l => l.trim()).filter(l => l != "") //Satırları ayır
                .map(l =>
                    l.split(/\s\s*/)//Satırdaki durumları ayır
                        .map(durum => {
                            durum = durum.trim().toUpperCase();
                            if (!durum.split('').every(c => durumlarKumesi.includes(c)) && durum != '-')
                                throw new Error(`Durum geçişlerinde tespit edilen yanlış karakter bulundu: ${durum}. Durum geçişleri girdisindeki durumlar, durumlar kümesinin bir elemanı(${durumlarKumesi.join(',')}) olmalı yada '-' karakteri olmalıdır.`);
                            return durum;
                        })
                );
        }
        else if (!Array.isArray(durumGecisleri)) throw new Error(`Durum geçişleri string yada matris formatında olmalı!`);


        if (durumGecisleri.length < durumlarKumesi.length) throw new Error(`Durum geçişleri girdisi tüm durumlara ait girdiler içermelidir. ${durumlarKumesi.length - durumGecisleri.length} Satır eksik girdi girildi.`);
        else if (durumGecisleri.length > durumlarKumesi.length) throw new Error(`Durum geçişleri girdisinde fazladan ${durumGecisleri.length - durumlarKumesi.length} satır tespit edildi.`);
        if (!durumGecisleri.every(row => row.length == girisAlfabesi.length)) throw new Error(`Durum geçişleri girdisinin her satırında giriş alfabesi([${girisAlfabesi.length}]${girisAlfabesi.join(',')}) kadar değer olmalı, boş küme için '-' sembolünü girebilirsiniz.`);
        this.durumGecisleri = durumGecisleri;

        //Her şey doğru....
    }

    convert2DFA() {
        let DFA = {
            durumlarKumesi: new Array(),
            girisAlfabesi: this.girisAlfabesi.slice(0),
            ucDurumlarKumesi: new Array(),
            durumGecisleri: new Array()
        };

        //BAŞLANGIÇ
        let kontrolEdilenGecisDurumlariSatiri = 0;
        let tumDurumlarKontrolEdildiMi = () => kontrolEdilenGecisDurumlariSatiri == DFA.durumlarKumesi.length;
        let durumGecisleriSatiriEkle = durumGecisleri => {
            DFA.durumGecisleri.push(durumGecisleri);
            durumGecisleriSatiriniKontrolEt(durumGecisleri);
        };
        let durumlarKumesindeVarMi = durum => DFA.durumlarKumesi.includes(durum);
        let yeniBaslangicDurumuEkle = durum => {
            DFA.durumlarKumesi.push(durum);
            if (durum.split("").find(harf => this.ucDurumlarKumesi.includes(harf))) DFA.ucDurumlarKumesi.push(durum);
        }
        let durumGecisleriSatiriniKontrolEt = durumGecisleri => {
            durumGecisleri.forEach(gDurum => {
                if (gDurum == "-" || durumlarKumesindeVarMi(gDurum)) return;
                yeniBaslangicDurumuEkle(gDurum);
            });
            ++kontrolEdilenGecisDurumlariSatiri;
        };


        //1.AŞAMA
        yeniBaslangicDurumuEkle(this.durumlarKumesi[0]); //İlk durumu al
        durumGecisleriSatiriEkle(this.durumGecisleri[0].slice(0)); //Alınan ilk duruma ait - başlangıç durumu - geçişler dizisi ekleniyor

        while (!tumDurumlarKontrolEdildiMi()) { //İkinci ve diğer satırların oluşturulması
            let bDurum = DFA.durumlarKumesi[kontrolEdilenGecisDurumlariSatiri];
            let yeniGecisDurumuSatiri = DFA.girisAlfabesi.map((_, colIdx) => {
                let gDurumHarfleri = bDurum.split('').map(harf => {
                    let rowIdx = this.durumlarKumesi.indexOf(harf);
                    return this.durumGecisleri[rowIdx][colIdx]
                }).filter(harf => harf != "-");
                if (gDurumHarfleri.length == 0) gDurumHarfleri = "-";
                else {
                    gDurumHarfleri = [
                        ...new Set(
                            gDurumHarfleri.map(d => d.split(''))
                                .reduce((acc, d) => {
                                    acc.push(...d);
                                    return acc;
                                }, [])
                        )
                    ].join('');
                }
                return gDurumHarfleri.split('').sort((a, b)=> a.charCodeAt(0) - b.charCodeAt(0)).join('');
            });

            durumGecisleriSatiriEkle(yeniGecisDurumuSatiri); //Oluşturulan durum geçişleri satırının eklenmesi
        }

        //2.AŞAMA - İSİMLENDİRME
        let finalDFA = {};
        finalDFA.girisAlfabesi = DFA.girisAlfabesi.slice(0);
        let yeniDurumlarKumesi = Array.from({ length: DFA.durumlarKumesi.length }, (_, i) => "S" + i);
        finalDFA.ucDurumlarKumesi = DFA.ucDurumlarKumesi.map(durum => yeniDurumlarKumesi[DFA.durumlarKumesi.indexOf(durum)]);
        finalDFA.durumGecisleri = DFA.durumGecisleri.map(satir => satir.map(gDurum => {
            if (gDurum == "-") return "-";
            return yeniDurumlarKumesi[DFA.durumlarKumesi.indexOf(gDurum)];
        }));
        finalDFA.durumlarKumesi = yeniDurumlarKumesi;


        return [DFA, finalDFA];
    }
}

NFA.prototype.print = function (titles = null, multi = null, mtxIdx = -1, prevLines = []) {
    let lines = [], line;

    let mLen1 = 0; //Durum geçişleri matrisindeki en uzun metnin uzunluğunu tutacak
    this.durumGecisleri.forEach(satir => satir.forEach(durum => { mLen1 = Math.max(mLen1, durum.length); }));

    let mLen2 = 0; //Durumlar kümesinde bulunan en uzun metnin uzunluğunu tutacak
    this.durumlarKumesi.forEach(durum => mLen2 = Math.max(mLen2, durum.length));

    let space = num => " ".repeat(Math.max(0, num)); //Boşluk oluşturarak matrisi düzenli bir şekilde göstermeyi amaçlıyoruz.

    //Başlık
    let title;
    if (Array.isArray(titles)) {
        if (mtxIdx + 1 < titles.length) title = titles[mtxIdx + 1];
    }
    else if (typeof titles == "string") title = titles;

    if (typeof title == "string") {
        let width = mLen2 + 2 +
            this.girisAlfabesi.length * mLen1 +
            (this.girisAlfabesi.length - 1) * 2;

        width -= title.length; //Metni ortalamak için

        let line =
            (
                space(parseInt(width / 2)) +
                title.toUpperCase() +
                space(width - parseInt(width / 2))
            ).bgRed;
        if (multi == null) console.log(line);
        else lines.push(line);
    }

    //Matrisin sütun değerlerini yani giriş alfabesini yazdırıyoruz
    line =
        space(mLen2 + 1) + //En uzun durum metni + 1 karakter sola boşluk bırak
        this.girisAlfabesi.map(input =>
            space(1) +
            space(mLen1 - 1).underline.green +
            input.toString().underline.green
        ).join(space(1)) //Her giriş alfabesi arasında renksiz ve stilsiz bir boşluk olacak
    if (multi == null) console.log(line);
    else lines.push(line);

    this.durumGecisleri.map((row, idx) => {
        bDurum = this.durumlarKumesi[idx]; //Bu satırdaki geçişlere sahip başlangıç durumu

        line =
            space(mLen2 - bDurum.length) + //Başlangıç durumlarını sağa yaslamak için gerekiyorsa başa boşluk gelecek
            (
                this.ucDurumlarKumesi.includes(bDurum) ? //Başlangıç durumu, uç durum mu?
                    //Evet uç durum:
                    bDurum.split('').map(harf => //Durum birden fazla karakterden oluşabilir
                        // _ucDurumlar.includes(harf) ?
                        //     harf.bold.cyan.inverse :
                        harf
                    ).join('').bgRed : //Uç durumsa arka planı kırmızı olarak yazdırılsın

                    //Hayır uç durum değil:
                    bDurum //O zaman sade olarak yazdırılsın
            ) +

            "|".yellow + " " +

            row.map(gDurum => //Geçiş durum
                space(mLen1 - gDurum.length) + //Geçiş durumlarını sağa yaslamak için gerekiyorsa önüne boşluk gelecek
                (
                    gDurum == "-" ? //Geçiş durumu boş küme olarak belirtilmiş ise
                        "ø".gray : //Boş küme sembolünü gri şeklinde yazdır
                        gDurum //Aksi taktirde geçiş durum metnini sade olarak yazdır
                )
            ).join(space(2)); //Her iki sütun, 2 boşluk karakteri ile ayrılsın

        if (multi == null) console.log(line);
        else lines.push(line);
    });

    if (multi != null) { //titles = null, multi = null, mtxIdx = -1, prevLines = []
        prevLines.push(lines);
        if (mtxIdx + 1 == multi.length) {
            for (let i = 0, len = prevLines[0].length; i < len; i++) {
                let lines = [];
                prevLines.forEach(l => lines.push(l[i]));
                console.log(lines.join(parseInt(len / 2) == i ? '   =>  ' : '       '));
            }
            console.log("");
            return;
        }
        NFA.prototype.print.call(multi[mtxIdx + 1], ...[titles, multi, mtxIdx + 1, prevLines]);
    }
    else console.log("");
}

let NFAExamples = [
    [ //Example: 1
        ['A', 'B', 'C', 'D', 'E'],
        ['0', '1'],
        ['E'],
        `A AB
        D C
        E -
        - E
        - -`
    ],
    [ //Example: 2
        ['A', 'B', 'C', 'D', 'E', 'F'],
        ['0', '1', '2'],
        ['F'],
        `AB A AC
        - D -
        - E -
        - - F
        F - -
        F F F`
    ],
    [ //Example: 3
        ['A', 'B', 'C', 'D', 'E', 'F'],
        ['a', 'b', 'c', 'd'],
        ['F'],
        `B DF C -
        B DF - -
        - - F E
        DF - - -
        - - F E
        B DF C -`
    ],
    [ //Example: 4
        ['A', 'B', 'C', 'D', 'E', 'F'],
        ['a', 'b', 'c', 'd'],
        ['F'],
        `B DF C -
        B DF - -
        - - F E
        D - - -
        - - F E
        B DF C -`
    ],
    [ //Example: 5
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'],
        ['0', '1'],
        ['J'],
        `BG CH
        - E
        F -
        G H
        J -
        - J
        JD -
        - JD
        BG CH`
    ],
];

let centerText = (text, width, fill = " ") => {
    width = Math.max(0, width - text.length / 2);
    let right = parseInt(width / 2);
    return fill.repeat(width - right) + text + fill.repeat(right);
}

for (let i = 0, nfa; i < NFAExamples.length; i++) {
    console.log(centerText(` EXAMPLE${i + 1} `, 50, "="));
    nfa = new NFA(...NFAExamples[i]);
    nfa.print("NFA");

    var DFAs = nfa.convert2DFA();
    NFA.prototype.print.call(DFAs[0], ...[['DFA', "Renamed DFA"], [DFAs[1]]]);
    console.log();
}
