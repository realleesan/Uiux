const fs = require('fs');
const p='src/App.tsx'; let s=fs.readFileSync(p,'utf8');
s=s.replace('import { FormEvent, useEffect, useState }', 'import { FormEvent, useEffect, useRef, useState }');
s=s.replace('snippet: "Cảm ơn shop nhé!",\n    lastCustomerMessage: "Cảm ơn shop nhé!",','snippet: "Em cao 1m60, nặng 50kg thì chọn size nào ạ?",\n    lastCustomerMessage: "Em cao 1m60, nặng 50kg thì chọn size nào ạ?",');
s=s.replace('snippet: "Kiểm tra lịch giao hàng",\n    lastCustomerMessage: "Đơn của mình dự kiến khi nào giao?",','snippet: "Shop: Để mình kiểm tra size L màu đen trong kho nhé.",\n    lastCustomerMessage: "Shop kiểm tra giúp mình size L màu đen còn không nhé.",');
s=s.replace('snoozeNote: "Kiểm tra lịch giao hàng"', 'snoozeNote: "Kiểm tra size L màu đen, mã AT02"');
const history=`
type HistoryMessage = { from: "customer" | "shop"; text: string; time: string }

// Nội dung mẫu minh họa các tình huống tư vấn ở phần 1–4.
const initialHistory: HistoryMessage[][] = [
  [
    { from: "customer", text: "Shop ơi, em muốn hỏi mẫu váy VD01 màu trắng ạ.", time: "10:30" },
    { from: "shop", text: "Dạ mẫu VD01 giá 350.000đ, chất cotton có lót. Bạn muốn shop tư vấn size không ạ?", time: "10:31" },
    { from: "customer", text: "Em cao 1m60, nặng 50kg, thường mặc size M. Mẫu này còn M không ạ?", time: "10:33" },
    { from: "shop", text: "Dạ mẫu này còn size M màu trắng, phù hợp số đo của bạn. Phí vận chuyển là 25.000đ, bạn có thể nhận hàng trả tiền hoặc chuyển khoản ạ.", time: "10:35" },
    { from: "customer", text: "Shop có hỗ trợ đổi size nếu mặc không vừa không ạ?", time: "10:36" },
    { from: "shop", text: "Dạ shop hỗ trợ đổi size trong 7 ngày, sản phẩm còn nguyên tem và chưa qua sử dụng. Bạn giữ giúp shop hóa đơn nhé.", time: "10:37" },
    { from: "customer", text: "Dạ shop ơi, em chốt lấy mẫu này nhé. Cho em xin thông tin chuyển khoản ạ!", time: "10:40" },
  ],
  [
    { from: "customer", text: "Shop ơi, áo sơ mi SM03 có những màu nào ạ?", time: "10:28" },
    { from: "shop", text: "Dạ mẫu SM03 có màu trắng và xanh, giá 280.000đ. Bạn đang tìm màu và size nào ạ?", time: "10:29" },
    { from: "customer", text: "Mình thường mặc size M, thích áo rộng một chút.", time: "10:30" },
    { from: "shop", text: "Bạn cho shop xin chiều cao và cân nặng để tư vấn size phù hợp nhé.", time: "10:31" },
    { from: "customer", text: "Mình cao 1m58, nặng 48kg. Mình muốn màu trắng, shop kiểm tra giúp mình nhé.", time: "10:34" },
  ],
  [
    { from: "customer", text: "Mình đang xem quần QJ02, size L màu xanh.", time: "09:48" },
    { from: "shop", text: "Dạ mẫu này giá 420.000đ. Bạn muốn dáng suông hay ôm để shop tư vấn thêm ạ?", time: "09:49" },
    { from: "customer", text: "Mình thích dáng suông, màu tối cho dễ phối đồ.", time: "09:51" },
    { from: "shop", text: "Dạ QJ02 là dáng suông, shop có màu xanh và đen. Bạn muốn chọn màu nào ạ?", time: "09:53" },
    { from: "customer", text: "Có thể đổi sang màu đen giúp mình?", time: "09:55" },
  ],
  [
    { from: "customer", text: "Shop tư vấn giúp em váy VD02 để đi làm với ạ.", time: "10:20" },
    { from: "shop", text: "Dạ VD02 là dáng chữ A, có màu be và đen, giá 390.000đ. Bạn thích màu nào ạ?", time: "10:21" },
    { from: "customer", text: "Em thích màu be, nhưng không rõ chọn size nào.", time: "10:23" },
    { from: "shop", text: "Bạn gửi giúp shop chiều cao, cân nặng và size thường mặc để mình tư vấn nhé.", time: "10:24" },
    { from: "customer", text: "Em cao 1m60, nặng 50kg thì chọn size nào ạ?", time: "10:26" },
  ],
  [
    { from: "customer", text: "Shop tư vấn giúp mình mẫu áo AK01 nhé.", time: "09:35" },
    { from: "shop", text: "Dạ AK01 giá 450.000đ, chất kaki, có màu be và đen. Bạn cho shop xin số đo để tư vấn size ạ.", time: "09:36" },
    { from: "customer", text: "Mình cao 1m65, nặng 53kg, thích màu be.", time: "09:38" },
    { from: "shop", text: "Dạ bạn chọn size M sẽ vừa, size L nếu thích rộng. Màu be còn cả hai size, phí giao hàng 25.000đ nhé.", time: "09:39" },
    { from: "customer", text: "Để mình suy nghĩ thêm rồi báo shop nhé.", time: "09:41" },
    { from: "shop", text: "Dạ, mình đợi bạn xác nhận thêm nhé.", time: "09:42" },
  ],
  [
    { from: "customer", text: "Mình muốn hỏi áo thun AT02 màu đen, shop còn hàng không?", time: "09:23" },
    { from: "shop", text: "Dạ AT02 giá 220.000đ, chất cotton. Bạn muốn lấy size nào ạ?", time: "09:24" },
    { from: "customer", text: "Mình cao 1m72, nặng 68kg, đang mặc size L.", time: "09:26" },
    { from: "shop", text: "Dạ size L phù hợp với bạn. Shop cần kiểm tra tồn kho màu đen trước khi xác nhận ạ.", time: "09:28" },
    { from: "customer", text: "Shop kiểm tra giúp mình size L màu đen còn không nhé.", time: "09:29" },
    { from: "shop", text: "Để mình kiểm tra size L màu đen trong kho nhé. Mình sẽ báo lại sau khoảng 5 phút ạ.", time: "09:30" },
  ],
]
`;
s=s.replace('const navItems:', history+'\nconst navItems:');
s=s.replace('    time: "Hôm qua",\n    wait: "1 giờ",','    time: "10:26",\n    wait: "15 phút",');
// Đồng bộ ca đang mở với danh sách, tránh xem nhầm khách sau khi lọc.
s=s.replace('  const customer = chats[activeChat]', `  useEffect(() => {
    if (visibleChats.length && !visibleChats.some(chat => chats.indexOf(chat) === activeChat)) {
      setActiveChat(chats.indexOf(visibleChats[0]))
    }
  }, [activeNav, search, chats, activeChat])
  const historyEnd = useRef<HTMLDivElement>(null)
  useEffect(() => {
    historyEnd.current?.scrollIntoView({ block: "end" })
  }, [activeChat, sentMessages])
  const customer = chats[activeChat]`);
s=s.replace('className="h-screen min-h-[640px] overflow-hidden bg-white text-[#1F2937]"', 'className="h-dvh min-h-[600px] overflow-hidden bg-[#F3F4F6] p-3 text-[#1F2937] lg:p-5"');
s=s.replace('className="app-shell grid h-full w-full grid-cols-[380px_minmax(0,1fr)] overflow-hidden bg-white"', 'className="app-shell mx-auto grid h-full w-full max-w-[1360px] grid-cols-[350px_minmax(0,1fr)] overflow-hidden rounded-lg border border-[#D1D5DB] bg-white"');
s=s.replace('className="flex h-[77px] shrink-0 items-center gap-3 border-b border-[#E5E7EB] px-6"', 'className="flex min-h-[76px] shrink-0 flex-wrap items-center gap-3 border-b border-[#E5E7EB] px-5 py-3"');
s=s.replace('<span>Đang hoạt động</span>', '<span>Facebook Messenger</span>');
s=s.replace('className="min-h-0 flex-1 overflow-y-auto bg-[#FAFAFA] px-8 py-6"', 'aria-label="Lịch sử hội thoại" className="min-h-0 flex-1 overflow-y-auto bg-[#FAFAFA] px-5 py-4"');
s=s.replace('className="mx-auto flex max-w-3xl flex-col"', 'className="flex min-h-full flex-col justify-end"');
const start=s.indexOf('              {activeChat === 0 ? (');
const end=s.indexOf('              {(sentMessages[activeChat]',start);
if(start<0||end<0) throw Error('History markers not found');
s=s.slice(0,start)+`              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E5E7EB]" />
                <span className="text-[11px] text-[#6B7280]">Hôm nay</span>
                <div className="h-px flex-1 bg-[#E5E7EB]" />
              </div>
              {initialHistory[activeChat].map((entry, index) => (
                <div key={index} className={"mb-3 flex max-w-[82%] items-end gap-2 " + (entry.from === "shop" ? "self-end" : "self-start")}>
                  {entry.from === "customer" && <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#9CA3AF] bg-white text-[10px] font-semibold">{customer.initials}</span>}
                  <div className="min-w-0">
                    <div className={"max-w-[560px] whitespace-pre-wrap break-words rounded-lg px-3.5 py-2.5 text-sm leading-[1.6] " + (entry.from === "shop" ? "rounded-br-sm bg-[#E5E7EB]" : "rounded-bl-sm border border-[#D1D5DB] bg-white")}>{entry.text}</div>
                    <div className={"mt-1 text-[11px] text-[#6B7280] " + (entry.from === "shop" ? "text-right" : "")}>{entry.time}{entry.from === "shop" ? " · Đã gửi" : ""}</div>
                  </div>
                </div>
              ))}
`+s.slice(end);
s=s.replace('"mb-5 max-w-[70%] "', '"mb-3 max-w-[82%] "');
s=s.replace('"rounded-xl px-4 py-3 text-left text-sm leading-6 "', '"max-w-[560px] whitespace-pre-wrap break-words rounded-lg px-3.5 py-2.5 text-left text-sm leading-[1.6] "');
s=s.replace('          <div role="status"', '          <div role="status"');
s=s.replace('            </div>\n          </div>\n\n          <div role="status"', '              <div ref={historyEnd} />\n            </div>\n          </div>\n\n          <div role="status"');
s=s.replace('className="mx-auto flex max-w-3xl items-end gap-3"', 'className="flex w-full items-end gap-3"');
s=s.replace('className="shrink-0 border-t border-[#E5E7EB] bg-white p-5"', 'className="shrink-0 border-t border-[#E5E7EB] bg-white px-5 py-3"');
fs.writeFileSync(p,s);
