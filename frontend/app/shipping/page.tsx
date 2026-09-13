export const metadata = {
    title: 'Shipping Policy | ShuddhEats',
};

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#fafaf7]">
            <div className="page-container max-w-4xl bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#475d2a] mb-8">Shipping Policy</h1>

                <div className="prose prose-emerald max-w-none text-gray-700 space-y-6">
                    <p>
                        Information regarding our shipping policy will be updated here soon. If you have any immediate questions regarding the shipping of your order, please contact our support team.
                    </p>
                    <p>
                        Email: <a href="mailto:shuddheats3126@gmail.com" className="text-[#475d2a] font-bold hover:underline">shuddheats3126@gmail.com</a><br/>
                        Phone: <a href="tel:+91 8850823761" className="text-[#475d2a] font-bold hover:underline">+91 8850823761</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

