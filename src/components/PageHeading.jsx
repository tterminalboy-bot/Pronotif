function PageHeading({eyebrow,title,sub,action}) { return <section className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{action}</section> }
export default PageHeading;
